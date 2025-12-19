const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GrepVesting", function () {
  let grepToken;
  let vesting;
  let owner;
  let beneficiary;
  let other;

  const ONE_DAY = 24 * 60 * 60;
  const ONE_MONTH = 30 * ONE_DAY;
  const ONE_YEAR = 365 * ONE_DAY;

  beforeEach(async function () {
    [owner, beneficiary, other] = await ethers.getSigners();

    // Deploy token
    const GrepToken = await ethers.getContractFactory("GrepToken");
    grepToken = await GrepToken.deploy();
    await grepToken.waitForDeployment();

    // Deploy vesting
    const GrepVesting = await ethers.getContractFactory("GrepVesting");
    vesting = await GrepVesting.deploy(await grepToken.getAddress());
    await vesting.waitForDeployment();

    // Approve vesting contract
    await grepToken.approve(await vesting.getAddress(), ethers.parseEther("100000000"));
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await vesting.grepToken()).to.equal(await grepToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await vesting.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Vesting Schedules", function () {
    it("Should create a vesting schedule", async function () {
      const amount = ethers.parseEther("1000000");
      const cliff = ONE_MONTH * 6; // 6 months cliff
      const duration = ONE_YEAR * 2; // 2 years total

      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0, // start now
        cliff,
        duration,
        true // revocable
      );

      const schedule = await vesting.schedules(beneficiary.address);
      expect(schedule.totalAmount).to.equal(amount);
      expect(schedule.cliffDuration).to.equal(cliff);
      expect(schedule.vestingDuration).to.equal(duration);
      expect(schedule.revocable).to.be.true;
    });

    it("Should transfer tokens to vesting contract", async function () {
      const amount = ethers.parseEther("1000000");
      const balanceBefore = await grepToken.balanceOf(await vesting.getAddress());

      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        ONE_MONTH,
        ONE_YEAR,
        false
      );

      const balanceAfter = await grepToken.balanceOf(await vesting.getAddress());
      expect(balanceAfter - balanceBefore).to.equal(amount);
    });

    it("Should reject zero amount", async function () {
      await expect(
        vesting.createVestingSchedule(beneficiary.address, 0, 0, ONE_MONTH, ONE_YEAR, false)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should reject duplicate schedule", async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        ethers.parseEther("1000"),
        0,
        ONE_MONTH,
        ONE_YEAR,
        false
      );

      await expect(
        vesting.createVestingSchedule(
          beneficiary.address,
          ethers.parseEther("1000"),
          0,
          ONE_MONTH,
          ONE_YEAR,
          false
        )
      ).to.be.revertedWith("Schedule exists");
    });
  });

  describe("Vesting Calculation", function () {
    const amount = ethers.parseEther("1200"); // 1200 tokens for easy math
    const cliff = ONE_MONTH * 6;
    const duration = ONE_YEAR;

    beforeEach(async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        false
      );
    });

    it("Should return 0 before cliff", async function () {
      await time.increase(ONE_MONTH * 3);
      expect(await vesting.vestedAmount(beneficiary.address)).to.equal(0);
    });

    it("Should vest proportionally after cliff", async function () {
      // Move to cliff end (6 months = 50% of 1 year)
      await time.increase(cliff);
      const vested = await vesting.vestedAmount(beneficiary.address);
      // Should be ~50% vested (6/12 months), allow for timing variance
      expect(vested).to.be.closeTo(ethers.parseEther("600"), ethers.parseEther("15"));
    });

    it("Should fully vest after duration", async function () {
      await time.increase(duration);
      expect(await vesting.vestedAmount(beneficiary.address)).to.equal(amount);
    });
  });

  describe("Releasing Tokens", function () {
    const amount = ethers.parseEther("1200");
    const cliff = ONE_MONTH * 6;
    const duration = ONE_YEAR;

    beforeEach(async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        false
      );
    });

    it("Should not release before cliff", async function () {
      await time.increase(ONE_MONTH * 3);
      await expect(
        vesting.connect(beneficiary).release()
      ).to.be.revertedWith("No tokens to release");
    });

    it("Should release after cliff", async function () {
      await time.increase(cliff);

      const balanceBefore = await grepToken.balanceOf(beneficiary.address);
      await vesting.connect(beneficiary).release();
      const balanceAfter = await grepToken.balanceOf(beneficiary.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should release all after duration", async function () {
      await time.increase(duration);

      await vesting.connect(beneficiary).release();

      expect(await grepToken.balanceOf(beneficiary.address)).to.equal(amount);
      expect(await vesting.releasableAmount(beneficiary.address)).to.equal(0);
    });

    it("Should track released amount", async function () {
      await time.increase(duration);
      await vesting.connect(beneficiary).release();

      const schedule = await vesting.schedules(beneficiary.address);
      expect(schedule.released).to.equal(amount);
    });
  });

  describe("Revocation", function () {
    const amount = ethers.parseEther("1200");
    const cliff = ONE_MONTH * 6;
    const duration = ONE_YEAR;

    it("Should allow revoking revocable schedule", async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        true // revocable
      );

      // Move to 9 months (75% vested)
      await time.increase(ONE_MONTH * 9);

      const ownerBalanceBefore = await grepToken.balanceOf(owner.address);
      await vesting.revoke(beneficiary.address);
      const ownerBalanceAfter = await grepToken.balanceOf(owner.address);

      // Owner should receive ~25% (unvested portion), allow for timing variance
      const returned = ownerBalanceAfter - ownerBalanceBefore;
      expect(returned).to.be.closeTo(ethers.parseEther("300"), ethers.parseEther("20"));
    });

    it("Should not allow revoking non-revocable schedule", async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        false // not revocable
      );

      await expect(
        vesting.revoke(beneficiary.address)
      ).to.be.revertedWith("Not revocable");
    });

    it("Should release vested tokens to beneficiary on revoke", async function () {
      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        true
      );

      await time.increase(cliff); // 50% vested

      const balanceBefore = await grepToken.balanceOf(beneficiary.address);
      await vesting.revoke(beneficiary.address);
      const balanceAfter = await grepToken.balanceOf(beneficiary.address);

      // Beneficiary should receive vested portion (~50%), allow for timing variance
      expect(balanceAfter - balanceBefore).to.be.closeTo(
        ethers.parseEther("600"),
        ethers.parseEther("15")
      );
    });
  });

  describe("Schedule Info", function () {
    it("Should return complete schedule info", async function () {
      const amount = ethers.parseEther("1000");
      const cliff = ONE_MONTH * 6;
      const duration = ONE_YEAR;

      await vesting.createVestingSchedule(
        beneficiary.address,
        amount,
        0,
        cliff,
        duration,
        true
      );

      await time.increase(cliff);

      const info = await vesting.getScheduleInfo(beneficiary.address);
      expect(info.total).to.equal(amount);
      expect(info.vested).to.be.closeTo(ethers.parseEther("500"), ethers.parseEther("15"));
      expect(info.released).to.equal(0);
      expect(info.isRevocable).to.be.true;
      expect(info.isRevoked).to.be.false;
    });
  });
});
