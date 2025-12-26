const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GrepToken", function () {
  let grepToken;
  let owner;
  let burner;
  let user1;
  let user2;

  const TOTAL_SUPPLY = ethers.parseEther("500000000"); // 500M fixed supply

  beforeEach(async function () {
    [owner, burner, user1, user2] = await ethers.getSigners();

    const GrepToken = await ethers.getContractFactory("GrepToken");
    grepToken = await GrepToken.deploy();
    await grepToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await grepToken.name()).to.equal("GrepCoin");
      expect(await grepToken.symbol()).to.equal("GREP");
    });

    it("Should mint total supply to deployer", async function () {
      expect(await grepToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set the correct total supply", async function () {
      expect(await grepToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should set the correct owner", async function () {
      expect(await grepToken.owner()).to.equal(owner.address);
    });

    it("Should have correct total supply constant", async function () {
      expect(await grepToken.TOTAL_SUPPLY()).to.equal(TOTAL_SUPPLY);
    });

    it("Should start with zero burned tokens", async function () {
      expect(await grepToken.totalBurned()).to.equal(0);
    });
  });

  describe("Burner Management", function () {
    it("Should allow owner to add burner", async function () {
      await expect(grepToken.addBurner(burner.address))
        .to.emit(grepToken, "BurnerAdded")
        .withArgs(burner.address);

      expect(await grepToken.burners(burner.address)).to.be.true;
    });

    it("Should allow owner to remove burner", async function () {
      await grepToken.addBurner(burner.address);

      await expect(grepToken.removeBurner(burner.address))
        .to.emit(grepToken, "BurnerRemoved")
        .withArgs(burner.address);

      expect(await grepToken.burners(burner.address)).to.be.false;
    });

    it("Should not allow non-owner to add burner", async function () {
      await expect(
        grepToken.connect(user1).addBurner(burner.address)
      ).to.be.revertedWithCustomError(grepToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow adding zero address as burner", async function () {
      await expect(
        grepToken.addBurner(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid burner address");
    });
  });

  describe("Burning", function () {
    it("Should burn tokens correctly", async function () {
      const burnAmount = ethers.parseEther("1000");

      await grepToken.burn(burnAmount);

      expect(await grepToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - burnAmount);
      expect(await grepToken.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
      expect(await grepToken.totalBurned()).to.equal(burnAmount);
    });

    it("Should burn with reason and emit event", async function () {
      const burnAmount = ethers.parseEther("100");
      const reason = "Evolution vote";

      await expect(grepToken.burnWithReason(burnAmount, reason))
        .to.emit(grepToken, "TokensBurnedFor")
        .withArgs(owner.address, burnAmount, reason);

      expect(await grepToken.totalBurned()).to.equal(burnAmount);
    });

    it("Should allow burnFrom with approval", async function () {
      const burnAmount = ethers.parseEther("500");

      // Transfer some tokens to user1
      await grepToken.transfer(user1.address, burnAmount);

      // User1 approves owner to burn
      await grepToken.connect(user1).approve(owner.address, burnAmount);

      await grepToken.burnFrom(user1.address, burnAmount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(0);
      expect(await grepToken.totalBurned()).to.equal(burnAmount);
    });

    it("Should allow authorized burner to burnFromWithReason", async function () {
      const burnAmount = ethers.parseEther("100");
      const reason = "Marketplace fee";

      await grepToken.addBurner(burner.address);
      await grepToken.transfer(user1.address, burnAmount);
      await grepToken.connect(user1).approve(burner.address, burnAmount);

      await expect(grepToken.connect(burner).burnFromWithReason(user1.address, burnAmount, reason))
        .to.emit(grepToken, "TokensBurnedFor")
        .withArgs(user1.address, burnAmount, reason);

      expect(await grepToken.totalBurned()).to.equal(burnAmount);
    });

    it("Should not allow unauthorized burnFromWithReason", async function () {
      const burnAmount = ethers.parseEther("100");

      await grepToken.transfer(user1.address, burnAmount);
      await grepToken.connect(user1).approve(user2.address, burnAmount);

      await expect(
        grepToken.connect(user2).burnFromWithReason(user1.address, burnAmount, "test")
      ).to.be.revertedWith("Not authorized to burn");
    });
  });

  describe("Supply Tracking", function () {
    it("Should calculate circulating supply correctly", async function () {
      const burnAmount = ethers.parseEther("10000");

      await grepToken.burn(burnAmount);

      expect(await grepToken.circulatingSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("Should calculate burn percentage correctly", async function () {
      // Burn 5% of supply (25M)
      const burnAmount = ethers.parseEther("25000000");

      await grepToken.burn(burnAmount);

      // 500 basis points = 5%
      expect(await grepToken.burnPercentage()).to.equal(500);
    });
  });

  describe("ERC20 Functionality", function () {
    it("Should transfer tokens correctly", async function () {
      const amount = ethers.parseEther("1000");
      await grepToken.transfer(user1.address, amount);

      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
      expect(await grepToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - amount);
    });

    it("Should approve and transferFrom correctly", async function () {
      const amount = ethers.parseEther("1000");
      await grepToken.approve(user1.address, amount);

      expect(await grepToken.allowance(owner.address, user1.address)).to.equal(amount);

      await grepToken.connect(user1).transferFrom(owner.address, user2.address, amount);

      expect(await grepToken.balanceOf(user2.address)).to.equal(amount);
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await grepToken.pause();
      expect(await grepToken.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await grepToken.pause();

      await expect(
        grepToken.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(grepToken, "EnforcedPause");
    });

    it("Should allow transfers after unpause", async function () {
      await grepToken.pause();
      await grepToken.unpause();

      const amount = ethers.parseEther("100");
      await grepToken.transfer(user1.address, amount);
      expect(await grepToken.balanceOf(user1.address)).to.equal(amount);
    });
  });
});
