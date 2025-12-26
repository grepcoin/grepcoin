const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer address:", deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
