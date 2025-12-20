const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploy all GrepCoin contracts in the correct order
 * 1. GrepToken (ERC20)
 * 2. GrepStakingPool (depends on Token)
 * 3. GrepVesting (depends on Token)
 * 4. GrepAchievements (ERC-1155)
 *
 * Saves deployment addresses to deployments/{network}.json
 * Optionally verifies on Basescan if API key is available
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("========================================");
  console.log("GREPCOIN CONTRACT DEPLOYMENT");
  console.log("========================================");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("========================================\n");

  const deployments = {};
  const verificationData = [];

  // 1. Deploy GrepToken
  console.log("1️⃣  Deploying GrepToken...");
  const GrepToken = await hre.ethers.getContractFactory("GrepToken");
  const grepToken = await GrepToken.deploy();
  await grepToken.waitForDeployment();
  const grepTokenAddress = await grepToken.getAddress();

  deployments.GrepToken = grepTokenAddress;
  verificationData.push({
    name: "GrepToken",
    address: grepTokenAddress,
    constructorArguments: []
  });

  console.log("✅ GrepToken deployed to:", grepTokenAddress);
  console.log("   Initial supply minted: 400M GREP\n");

  // 2. Deploy GrepStakingPool
  console.log("2️⃣  Deploying GrepStakingPool...");
  const GrepStakingPool = await hre.ethers.getContractFactory("GrepStakingPool");
  const stakingPool = await GrepStakingPool.deploy(grepTokenAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();

  deployments.GrepStakingPool = stakingPoolAddress;
  verificationData.push({
    name: "GrepStakingPool",
    address: stakingPoolAddress,
    constructorArguments: [grepTokenAddress]
  });

  console.log("✅ GrepStakingPool deployed to:", stakingPoolAddress);
  console.log("   Token address:", grepTokenAddress, "\n");

  // 3. Deploy GrepVesting
  console.log("3️⃣  Deploying GrepVesting...");
  const GrepVesting = await hre.ethers.getContractFactory("GrepVesting");
  const grepVesting = await GrepVesting.deploy(grepTokenAddress);
  await grepVesting.waitForDeployment();
  const vestingAddress = await grepVesting.getAddress();

  deployments.GrepVesting = vestingAddress;
  verificationData.push({
    name: "GrepVesting",
    address: vestingAddress,
    constructorArguments: [grepTokenAddress]
  });

  console.log("✅ GrepVesting deployed to:", vestingAddress);
  console.log("   Token address:", grepTokenAddress, "\n");

  // 4. Deploy GrepAchievements
  console.log("4️⃣  Deploying GrepAchievements...");
  const baseUri = process.env.ACHIEVEMENTS_BASE_URI || "https://api.grepcoin.xyz/achievements/{id}.json";
  const achievementsSigner = process.env.ACHIEVEMENTS_SIGNER || deployer.address;

  const GrepAchievements = await hre.ethers.getContractFactory("GrepAchievements");
  const grepAchievements = await GrepAchievements.deploy(baseUri, achievementsSigner);
  await grepAchievements.waitForDeployment();
  const achievementsAddress = await grepAchievements.getAddress();

  deployments.GrepAchievements = achievementsAddress;
  verificationData.push({
    name: "GrepAchievements",
    address: achievementsAddress,
    constructorArguments: [baseUri, achievementsSigner]
  });

  console.log("✅ GrepAchievements deployed to:", achievementsAddress);
  console.log("   Base URI:", baseUri);
  console.log("   Signer:", achievementsSigner, "\n");

  // 5. Setup roles
  console.log("5️⃣  Setting up roles...");

  // Add StakingPool as minter for token rewards
  console.log("   Adding StakingPool as token minter...");
  const addMinterTx = await grepToken.addMinter(stakingPoolAddress);
  await addMinterTx.wait();
  console.log("   ✅ StakingPool can now mint staking rewards\n");

  // Save deployment data
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  const deploymentData = {
    network,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: deployments
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log("📝 Deployment data saved to:", deploymentFile, "\n");

  // Summary
  console.log("========================================");
  console.log("DEPLOYMENT COMPLETE ✅");
  console.log("========================================");
  console.log("Network:", network);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("\nContracts:");
  console.log("  GrepToken:         ", deployments.GrepToken);
  console.log("  GrepStakingPool:   ", deployments.GrepStakingPool);
  console.log("  GrepVesting:       ", deployments.GrepVesting);
  console.log("  GrepAchievements:  ", deployments.GrepAchievements);
  console.log("========================================\n");

  // Verify contracts on Basescan
  if (process.env.BASESCAN_API_KEY && network !== "hardhat" && network !== "localhost") {
    console.log("🔍 Starting contract verification on Basescan...\n");

    for (const contract of verificationData) {
      try {
        console.log(`Verifying ${contract.name}...`);
        await hre.run("verify:verify", {
          address: contract.address,
          constructorArguments: contract.constructorArguments,
        });
        console.log(`✅ ${contract.name} verified!\n`);
      } catch (error) {
        if (error.message.includes("Already Verified")) {
          console.log(`ℹ️  ${contract.name} already verified\n`);
        } else {
          console.log(`❌ ${contract.name} verification failed:`, error.message, "\n");
        }
      }
    }

    console.log("Verification complete!\n");
  } else {
    console.log("ℹ️  Skipping verification (no BASESCAN_API_KEY or local network)\n");
    console.log("To verify later, run: npx hardhat run scripts/verify.js --network", network, "\n");
  }

  // Output config for frontend
  console.log("========================================");
  console.log("FRONTEND CONFIGURATION");
  console.log("========================================");
  console.log("Add this to your frontend contracts config:\n");
  console.log(`  ${hre.network.config.chainId}: {`);
  console.log(`    GREP_TOKEN: '${deployments.GrepToken}',`);
  console.log(`    STAKING_POOL: '${deployments.GrepStakingPool}',`);
  console.log(`    VESTING: '${deployments.GrepVesting}',`);
  console.log(`    ACHIEVEMENTS: '${deployments.GrepAchievements}',`);
  console.log(`  },`);
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
