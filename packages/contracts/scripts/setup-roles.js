const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Setup roles and permissions for deployed contracts
 * - Grant minter role to staking contract
 * - Update signer for achievements (if needed)
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("⚙️  Setting up contract roles and permissions");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address, "\n");

  // Load deployment file
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}\nPlease deploy contracts first.`);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentData.contracts;

  // Get contract instances
  const grepToken = await hre.ethers.getContractAt("GrepToken", contracts.GrepToken);
  const stakingPool = await hre.ethers.getContractAt("GrepStakingPool", contracts.GrepStakingPool);
  const achievements = await hre.ethers.getContractAt("GrepAchievements", contracts.GrepAchievements);

  console.log("Loaded contracts:");
  console.log("  GrepToken:", contracts.GrepToken);
  console.log("  GrepStakingPool:", contracts.GrepStakingPool);
  console.log("  GrepAchievements:", contracts.GrepAchievements, "\n");

  // 1. Setup token minters
  console.log("1️⃣  Configuring token minters...");

  const isStakingMinter = await grepToken.minters(contracts.GrepStakingPool);
  if (!isStakingMinter) {
    console.log("   Adding StakingPool as minter...");
    const tx = await grepToken.addMinter(contracts.GrepStakingPool);
    await tx.wait();
    console.log("   ✅ StakingPool can now mint staking rewards");
  } else {
    console.log("   ℹ️  StakingPool already has minter role");
  }

  // Optional: Add vesting contract as minter if needed for special allocations
  const addVestingAsMinter = process.env.VESTING_AS_MINTER === "true";
  if (addVestingAsMinter) {
    const isVestingMinter = await grepToken.minters(contracts.GrepVesting);
    if (!isVestingMinter) {
      console.log("   Adding Vesting as minter...");
      const tx = await grepToken.addMinter(contracts.GrepVesting);
      await tx.wait();
      console.log("   ✅ Vesting can now mint tokens");
    } else {
      console.log("   ℹ️  Vesting already has minter role");
    }
  }

  console.log();

  // 2. Setup achievements signer
  console.log("2️⃣  Configuring achievements signer...");

  const currentSigner = await achievements.signer();
  const desiredSigner = process.env.ACHIEVEMENTS_SIGNER || deployer.address;

  if (currentSigner.toLowerCase() !== desiredSigner.toLowerCase()) {
    console.log(`   Updating signer from ${currentSigner} to ${desiredSigner}...`);
    const tx = await achievements.setSigner(desiredSigner);
    await tx.wait();
    console.log("   ✅ Signer updated");
  } else {
    console.log(`   ℹ️  Signer already set to ${currentSigner}`);
  }

  console.log();

  // 3. Verify setup
  console.log("3️⃣  Verifying configuration...");

  const stakingMinterStatus = await grepToken.minters(contracts.GrepStakingPool);
  const achievementsSigner = await achievements.signer();

  console.log("   Token minters:");
  console.log(`     StakingPool: ${stakingMinterStatus ? "✅" : "❌"}`);
  console.log("   Achievements:");
  console.log(`     Signer: ${achievementsSigner}`);

  console.log();

  // 4. Display remaining mintable amounts
  console.log("4️⃣  Token supply information...");
  const [stakingRemaining, gameplayRemaining, airdropsRemaining] = await grepToken.getRemainingMintable();
  console.log(`   Staking rewards remaining:  ${hre.ethers.formatEther(stakingRemaining)} GREP`);
  console.log(`   Gameplay rewards remaining: ${hre.ethers.formatEther(gameplayRemaining)} GREP`);
  console.log(`   Airdrops remaining:         ${hre.ethers.formatEther(airdropsRemaining)} GREP`);

  console.log("\n========================================");
  console.log("ROLES SETUP COMPLETE ✅");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:");
    console.error(error);
    process.exit(1);
  });
