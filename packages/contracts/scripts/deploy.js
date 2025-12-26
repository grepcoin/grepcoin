const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy GrepToken (500M fixed supply - AI Evolution Economy)
  console.log("\n1. Deploying GrepToken (500M fixed supply)...");
  const GrepToken = await hre.ethers.getContractFactory("GrepToken");
  const grepToken = await GrepToken.deploy();
  await grepToken.waitForDeployment();
  const grepTokenAddress = await grepToken.getAddress();
  console.log("GrepToken deployed to:", grepTokenAddress);

  // Check total supply
  const totalSupply = await grepToken.totalSupply();
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), "GREP");

  // Deploy GrepStakingPool (Real Yield Model)
  console.log("\n2. Deploying GrepStakingPool (Real Yield Model)...");
  const GrepStakingPool = await hre.ethers.getContractFactory("GrepStakingPool");
  const stakingPool = await GrepStakingPool.deploy(grepTokenAddress);
  await stakingPool.waitForDeployment();
  const stakingPoolAddress = await stakingPool.getAddress();
  console.log("GrepStakingPool deployed to:", stakingPoolAddress);

  // Deploy GrepVesting
  console.log("\n3. Deploying GrepVesting...");
  const GrepVesting = await hre.ethers.getContractFactory("GrepVesting");
  const grepVesting = await GrepVesting.deploy(grepTokenAddress);
  await grepVesting.waitForDeployment();
  const vestingAddress = await grepVesting.getAddress();
  console.log("GrepVesting deployed to:", vestingAddress);

  // Summary
  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("Network:", hre.network.name);
  console.log("GrepToken:", grepTokenAddress);
  console.log("GrepStakingPool:", stakingPoolAddress);
  console.log("GrepVesting:", vestingAddress);
  console.log("========================================");

  // Output for contracts.ts update
  console.log("\nUpdate src/lib/contracts.ts with:");
  console.log(`
  // Base Sepolia (testnet)
  84532: {
    GREP_TOKEN: '${grepTokenAddress}',
    STAKING_POOL: '${stakingPoolAddress}',
    VESTING: '${vestingAddress}',
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

    try {
      await hre.run("verify:verify", {
        address: vestingAddress,
        constructorArguments: [grepTokenAddress],
      });
      console.log("GrepVesting verified!");
    } catch (e) {
      console.log("GrepVesting verification failed:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
