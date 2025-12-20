const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify all deployed contracts on Basescan
 * Reads deployment data from deployments/{network}.json
 */
async function main() {
  const network = hre.network.name;

  if (network === "hardhat" || network === "localhost") {
    console.log("Cannot verify on local network");
    return;
  }

  if (!process.env.BASESCAN_API_KEY) {
    throw new Error("BASESCAN_API_KEY not set in .env file");
  }

  console.log("🔍 Verifying contracts on Basescan");
  console.log("Network:", network, "\n");

  // Load deployment file
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contracts = deploymentData.contracts;

  console.log("Found contracts:");
  Object.entries(contracts).forEach(([name, address]) => {
    console.log(`  ${name}: ${address}`);
  });
  console.log();

  // Get achievements URI and signer from environment or use defaults
  const achievementsUri = process.env.ACHIEVEMENTS_BASE_URI || "https://api.grepcoin.xyz/achievements/{id}.json";
  const achievementsSigner = process.env.ACHIEVEMENTS_SIGNER || deploymentData.deployer;

  // Define verification tasks
  const verificationTasks = [
    {
      name: "GrepToken",
      address: contracts.GrepToken,
      constructorArguments: []
    },
    {
      name: "GrepStakingPool",
      address: contracts.GrepStakingPool,
      constructorArguments: [contracts.GrepToken]
    },
    {
      name: "GrepVesting",
      address: contracts.GrepVesting,
      constructorArguments: [contracts.GrepToken]
    },
    {
      name: "GrepAchievements",
      address: contracts.GrepAchievements,
      constructorArguments: [achievementsUri, achievementsSigner]
    }
  ];

  // Verify each contract
  for (const task of verificationTasks) {
    if (!task.address) {
      console.log(`⏭️  Skipping ${task.name} (not deployed)\n`);
      continue;
    }

    try {
      console.log(`Verifying ${task.name} at ${task.address}...`);
      await hre.run("verify:verify", {
        address: task.address,
        constructorArguments: task.constructorArguments,
      });
      console.log(`✅ ${task.name} verified!\n`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`ℹ️  ${task.name} already verified\n`);
      } else {
        console.log(`❌ ${task.name} verification failed:`);
        console.log(`   ${error.message}\n`);
      }
    }

    // Add delay between verifications to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("Verification process complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
