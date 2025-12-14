const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GrepToken", function () {
  let grepToken;
  let owner;
  let minter;
  let user1;
  let user2;

  const INITIAL_SUPPLY = ethers.parseEther("400000000"); // 400M
  const MAX_SUPPLY = ethers.parseEther("1000000000"); // 1B
  const STAKING_CAP = ethers.parseEther("300000000"); // 300M
  const GAMEPLAY_CAP = ethers.parseEther("200000000"); // 200M
  const AIRDROPS_CAP = ethers.parseEther("100000000"); // 100M

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const GrepToken = await ethers.getContractFactory("GrepToken");
    grepToken = await GrepToken.deploy();
    await grepToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await grepToken.name()).to.equal("GrepCoin");
      expect(await grepToken.symbol()).to.equal("GREP");
    });

    it("Should mint initial supply to deployer", async function () {
      expect(await grepToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct total supply", async function () {
      expect(await grepToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct owner", async function () {
      expect(await grepToken.owner()).to.equal(owner.address);
    });

    it("Should have correct max supply constant", async function () {
      expect(await grepToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Minter Management", function () {
    it("Should allow owner to add minter", async function () {
      await expect(grepToken.addMinter(minter.address))
        .to.emit(grepToken, "MinterAdded")
        .withArgs(minter.address);

      expect(await grepToken.minters(minter.address)).to.be.true;
    });

    it("Should allow owner to remove minter", async function () {
      await grepToken.addMinter(minter.address);

      await expect(grepToken.removeMinter(minter.address))
        .to.emit(grepToken, "MinterRemoved")
        .withArgs(minter.address);

      expect(await grepToken.minters(minter.address)).to.be.false;
    });

    it("Should not allow non-owner to add minter", async function () {
      await expect(
        grepToken.connect(user1).addMinter(minter.address)
      ).to.be.revertedWithCustomError(grepToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow adding zero address as minter", async function () {
      await expect(
        grepToken.addMinter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid minter address");
    });
  });

  describe("Staking Rewards Minting", function () {
    beforeEach(async function () {
      await grepToken.addMinter(minter.address);
    });

    it("Should allow minter to mint staking rewards", async function () {
      const amount = ethers.parseEther("1000");

      await expect(grepToken.connect(minter).mintStakingRewards(user1.address, amount))
        .to.emit(grepToken, "StakingRewardsMinted")
        .withArgs(user1.address, amount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
      expect(await grepToken.stakingRewardsMinted()).to.equal(amount);
    });

    it("Should allow owner to mint staking rewards", async function () {
      const amount = ethers.parseEther("1000");
      await grepToken.mintStakingRewards(user1.address, amount);
      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should not allow non-minter to mint staking rewards", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        grepToken.connect(user1).mintStakingRewards(user2.address, amount)
      ).to.be.revertedWith("Not authorized to mint");
    });

    it("Should not exceed staking rewards cap", async function () {
      const overCap = STAKING_CAP + ethers.parseEther("1");
      await expect(
        grepToken.connect(minter).mintStakingRewards(user1.address, overCap)
      ).to.be.revertedWith("Staking rewards cap exceeded");
    });
  });

  describe("Gameplay Rewards Minting", function () {
    beforeEach(async function () {
      await grepToken.addMinter(minter.address);
    });

    it("Should allow minter to mint gameplay rewards", async function () {
      const amount = ethers.parseEther("500");

      await expect(grepToken.connect(minter).mintGameplayRewards(user1.address, amount))
        .to.emit(grepToken, "GameplayRewardsMinted")
        .withArgs(user1.address, amount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
      expect(await grepToken.gameplayRewardsMinted()).to.equal(amount);
    });

    it("Should not exceed gameplay rewards cap", async function () {
      const overCap = GAMEPLAY_CAP + ethers.parseEther("1");
      await expect(
        grepToken.connect(minter).mintGameplayRewards(user1.address, overCap)
      ).to.be.revertedWith("Gameplay rewards cap exceeded");
    });
  });

  describe("Airdrop Minting", function () {
    beforeEach(async function () {
      await grepToken.addMinter(minter.address);
    });

    it("Should allow minter to mint airdrops", async function () {
      const amount = ethers.parseEther("100");

      await expect(grepToken.connect(minter).mintAirdrop(user1.address, amount))
        .to.emit(grepToken, "AirdropMinted")
        .withArgs(user1.address, amount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
      expect(await grepToken.airdropsMinted()).to.equal(amount);
    });

    it("Should not exceed airdrops cap", async function () {
      const overCap = AIRDROPS_CAP + ethers.parseEther("1");
      await expect(
        grepToken.connect(minter).mintAirdrop(user1.address, overCap)
      ).to.be.revertedWith("Airdrops cap exceeded");
    });
  });

  describe("Max Supply Enforcement", function () {
    beforeEach(async function () {
      await grepToken.addMinter(minter.address);
    });

    it("Should not allow minting beyond max supply", async function () {
      // Mint up to near max supply via staking rewards
      await grepToken.connect(minter).mintStakingRewards(user1.address, STAKING_CAP);
      await grepToken.connect(minter).mintGameplayRewards(user1.address, GAMEPLAY_CAP);

      // Try to mint more than remaining cap
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY - STAKING_CAP - GAMEPLAY_CAP;
      const overMax = remaining + ethers.parseEther("1");

      await expect(
        grepToken.connect(minter).mintAirdrop(user1.address, overMax)
      ).to.be.revertedWith("Airdrops cap exceeded");
    });
  });

  describe("Remaining Mintable", function () {
    beforeEach(async function () {
      await grepToken.addMinter(minter.address);
    });

    it("Should return correct remaining mintable amounts", async function () {
      const stakingMint = ethers.parseEther("100000");
      const gameplayMint = ethers.parseEther("50000");
      const airdropMint = ethers.parseEther("25000");

      await grepToken.connect(minter).mintStakingRewards(user1.address, stakingMint);
      await grepToken.connect(minter).mintGameplayRewards(user1.address, gameplayMint);
      await grepToken.connect(minter).mintAirdrop(user1.address, airdropMint);

      const [stakingRemaining, gameplayRemaining, airdropsRemaining] =
        await grepToken.getRemainingMintable();

      expect(stakingRemaining).to.equal(STAKING_CAP - stakingMint);
      expect(gameplayRemaining).to.equal(GAMEPLAY_CAP - gameplayMint);
      expect(airdropsRemaining).to.equal(AIRDROPS_CAP - airdropMint);
    });
  });

  describe("ERC20 Functionality", function () {
    it("Should transfer tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      await grepToken.transfer(user1.address, amount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
      expect(await grepToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    });

    it("Should approve and transferFrom correctly", async function () {
      const amount = ethers.parseEther("1000");
      await grepToken.approve(user1.address, amount);

      expect(await grepToken.allowance(owner.address, user1.address)).to.equal(amount);

      await grepToken.connect(user1).transferFrom(owner.address, user2.address, amount);

      expect(await grepToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should burn tokens correctly", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await grepToken.balanceOf(owner.address);

      await grepToken.burn(burnAmount);

      expect(await grepToken.balanceOf(owner.address)).to.equal(initialBalance - burnAmount);
      expect(await grepToken.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
    });
  });
});
