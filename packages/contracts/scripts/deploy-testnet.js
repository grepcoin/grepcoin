const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Quick deployment script for Base Sepolia testnet
 * Skips verification for faster deployment
 * Use this for rapid testing iterations
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  // Validate we're on testnet
  if (network !== "baseSepolia" && network !== "hardhat" && network !== "localhost") {
    throw new Error("This script is for testnet only! Use deploy-all.js for mainnet.");
  }

  console.log("🚀 Quick Testnet Deployment");
  console.log("Network:", network);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  const deployments = {};

  // Deploy all contracts
  console.log("Deploying GrepToken...");
  const GrepToken = await hre.ethers.getContractFactory("GrepToken");
  const grepToken = await GrepToken.deploy();
  await grepToken.waitForDeployment();
  deployments.GrepToken = await grepToken.getAddress();
  console.log("✅", deployments.GrepToken);

  console.log("\nDeploying GrepStakingPool...");
  const GrepStakingPool = await hre.ethers.getContractFactory("GrepStakingPool");
  const stakingPool = await GrepStakingPool.deploy(deployments.GrepToken);
  await stakingPool.waitForDeployment();
  deployments.GrepStakingPool = await stakingPool.getAddress();
  console.log("✅", deployments.GrepStakingPool);

  console.log("\nDeploying GrepVesting...");
  const GrepVesting = await hre.ethers.getContractFactory("GrepVesting");
  const vesting = await GrepVesting.deploy(deployments.GrepToken);
  await vesting.waitForDeployment();
  deployments.GrepVesting = await vesting.getAddress();
  console.log("✅", deployments.GrepVesting);

  console.log("\nDeploying GrepAchievements...");
  const baseUri = "https://api.grepcoin.xyz/achievements/{id}.json";
  const GrepAchievements = await hre.ethers.getContractFactory("GrepAchievements");
  const achievements = await GrepAchievements.deploy(baseUri, deployer.address);
  await achievements.waitForDeployment();
  deployments.GrepAchievements = await achievements.getAddress();
  console.log("✅", deployments.GrepAchievements);

  // Setup roles
  console.log("\nSetting up minter role...");
  const tx = await grepToken.addMinter(deployments.GrepStakingPool);
  await tx.wait();
  console.log("✅ StakingPool is now a minter");

  // Save to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentData = {
    network,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: deployments
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${network}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE ✅");
  console.log("========================================");
  Object.entries(deployments).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
  console.log("========================================\n");
  console.log("To verify contracts later, run:");
  console.log(`npx hardhat run scripts/verify.js --network ${network}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
