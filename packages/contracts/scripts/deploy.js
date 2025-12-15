const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GrepToken
  console.log("\n1. Deploying GrepToken...");
  const GrepToken = await hre.ethers.getContractFactory("GrepToken");
  const grepToken = await GrepToken.deploy();
  await grepToken.waitForDeployment();
  const grepTokenAddress = await grepToken.getAddress();
  console.log("GrepToken deployed to:", grepTokenAddress);

  // Deploy GrepStakingPool
  console.log("\n2. Deploying GrepStakingPool...");
  const GrepStakingPool = await hre.ethers.getContractFactory("GrepStakingPool");
  const stakingPool = await GrepStakingPool.deploy(grepTokenAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log("GrepStakingPool deployed to:", stakingPoolAddress);

  // Add staking pool as minter
  console.log("\n3. Adding StakingPool as minter...");
  const addMinterTx = await grepToken.addMinter(stakingPoolAddress);
  await addMinterTx.wait();
  console.log("StakingPool added as minter");

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("Network:", hre.network.name);
  console.log("GrepToken:", grepTokenAddress);
  console.log("GrepStakingPool:", stakingPoolAddress);
  console.log("========================================");

  // Output for contracts.ts update
  console.log("\nUpdate src/lib/contracts.ts with:");
  console.log(`
  // Base Sepolia (testnet)
  84532: {
    GREP_TOKEN: '${grepTokenAddress}',
    STAKING_POOL: '${stakingPoolAddress}',
  },
`);

  // Verify contracts on Basescan (if API key is set)
  if (process.env.BASESCAN_API_KEY && hre.network.name !== "hardhat") {
    console.log("\nVerifying contracts on Basescan...");

    try {
      await hre.run("verify:verify", {
        address: grepTokenAddress,
        constructorArguments: [],
      });
      console.log("GrepToken verified!");
    } catch (e) {
      console.log("GrepToken verification failed:", e.message);
    }

    try {
      await hre.run("verify:verify", {
        address: stakingPoolAddress,
        constructorArguments: [grepTokenAddress],
      });
      console.log("GrepStakingPool verified!");
    } catch (e) {
      console.log("GrepStakingPool verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
