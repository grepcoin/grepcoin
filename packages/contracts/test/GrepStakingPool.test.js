const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GrepStakingPool", function () {
  let grepToken;
  let stakingPool;
  let owner;
  let user1;
  let user2;

  // Tier enum
  const Tier = {
    None: 0n,
    Flexible: 1n,
    Bronze: 2n,
    Silver: 3n,
    Gold: 4n,
    Diamond: 5n,
  };

  // Tier requirements
  const TIER_MIN_STAKES = {
    1: ethers.parseEther("100"),
    2: ethers.parseEther("1000"),
    3: ethers.parseEther("5000"),
    4: ethers.parseEther("10000"),
    5: ethers.parseEther("50000"),
  };

  const TIER_LOCK_DURATIONS = {
    1: 0n,
    2: BigInt(7 * 24 * 60 * 60), // 7 days
    3: BigInt(14 * 24 * 60 * 60), // 14 days
    4: BigInt(30 * 24 * 60 * 60), // 30 days
    5: BigInt(90 * 24 * 60 * 60), // 90 days
  };

  const TIER_MULTIPLIERS = {
    1: 11000n, // 1.1x
    2: 12500n, // 1.25x
    3: 15000n, // 1.5x
    4: 17500n, // 1.75x
    5: 20000n, // 2.0x
  };

  const TIER_BONUS_PLAYS = {
    1: 2n,
    2: 5n,
    3: 10n,
    4: 15n,
    5: 25n,
  };

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy GrepToken
    const GrepToken = await ethers.getContractFactory("GrepToken");
    grepToken = await GrepToken.deploy();
    await grepToken.waitForDeployment();

    // Deploy StakingPool
    const GrepStakingPool = await ethers.getContractFactory("GrepStakingPool");
    stakingPool = await GrepStakingPool.deploy(await grepToken.getAddress());
    await stakingPool.waitForDeployment();

    // Add staking pool as minter
    await grepToken.addMinter(await stakingPool.getAddress());

    // Transfer tokens to users for testing
    await grepToken.transfer(user1.address, ethers.parseEther("100000"));
    await grepToken.transfer(user2.address, ethers.parseEther("100000"));
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await stakingPool.grepToken()).to.equal(await grepToken.getAddress());
    });

    it("Should initialize tier info correctly", async function () {
      const flexibleTier = await stakingPool.tierInfo(Tier.Flexible);
      expect(flexibleTier.minStake).to.equal(TIER_MIN_STAKES[1]);
      expect(flexibleTier.lockDuration).to.equal(TIER_LOCK_DURATIONS[1]);
      expect(flexibleTier.multiplier).to.equal(TIER_MULTIPLIERS[1]);

      const diamondTier = await stakingPool.tierInfo(Tier.Diamond);
      expect(diamondTier.minStake).to.equal(TIER_MIN_STAKES[5]);
      expect(diamondTier.lockDuration).to.equal(TIER_LOCK_DURATIONS[5]);
      expect(diamondTier.multiplier).to.equal(TIER_MULTIPLIERS[5]);
    });

    it("Should start with zero total staked", async function () {
      expect(await stakingPool.totalStaked()).to.equal(0n);
      expect(await stakingPool.totalStakers()).to.equal(0n);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      // Approve staking pool to spend tokens
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should allow staking at Flexible tier", async function () {
      const stakeAmount = ethers.parseEther("100");

      await expect(stakingPool.connect(user1).stake(stakeAmount, Tier.Flexible))
        .to.emit(stakingPool, "Staked");

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Flexible);
    });

    it("Should allow staking at Bronze tier", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Bronze);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Bronze);
    });

    it("Should allow staking at Diamond tier", async function () {
      const stakeAmount = ethers.parseEther("50000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Diamond);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Diamond);
    });

    it("Should reject staking below minimum for tier", async function () {
      const belowMin = ethers.parseEther("50"); // Below 100 GREP minimum

      await expect(
        stakingPool.connect(user1).stake(belowMin, Tier.Flexible)
      ).to.be.revertedWith("Below minimum stake for tier");
    });

    it("Should reject staking with Tier.None", async function () {
      await expect(
        stakingPool.connect(user1).stake(ethers.parseEther("100"), Tier.None)
      ).to.be.revertedWith("Invalid tier");
    });

    it("Should update total staked and stakers count", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Bronze);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
      expect(await stakingPool.totalStakers()).to.equal(1n);

      // Second user stakes
      await grepToken.connect(user2).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
      await stakingPool.connect(user2).stake(stakeAmount, Tier.Bronze);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount * 2n);
      expect(await stakingPool.totalStakers()).to.equal(2n);
    });

    it("Should set correct lock duration", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Bronze);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      const expectedLockEnd = BigInt(await time.latest()) + TIER_LOCK_DURATIONS[2];

      // Allow 2 second tolerance for block time
      expect(stakeInfo.lockedUntil).to.be.closeTo(expectedLockEnd, 2n);
    });

    it("Should allow adding to existing stake", async function () {
      const firstStake = ethers.parseEther("1000");
      const secondStake = ethers.parseEther("5000"); // Must meet Silver minimum

      await stakingPool.connect(user1).stake(firstStake, Tier.Bronze);
      await stakingPool.connect(user1).stake(secondStake, Tier.Silver);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(firstStake + secondStake);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should allow unstaking after lock period (Flexible)", async function () {
      const stakeAmount = ethers.parseEther("100");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Flexible);

      // Flexible has no lock, can unstake immediately
      const balanceBefore = await grepToken.balanceOf(user1.address);
      await stakingPool.connect(user1).unstake();
      const balanceAfter = await grepToken.balanceOf(user1.address);

      // May receive small rewards, so check we got at least the stake back
      expect(balanceAfter - balanceBefore).to.be.gte(stakeAmount);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(0n);
    });

    it("Should allow unstaking after lock period (Bronze)", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Bronze);

      // Try to unstake before lock ends - should fail
      await expect(stakingPool.connect(user1).unstake()).to.be.revertedWith(
        "Stake is still locked"
      );

      // Fast forward past lock period
      await time.increase(Number(TIER_LOCK_DURATIONS[2]) + 1);

      // Now unstaking should work
      await stakingPool.connect(user1).unstake();

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(0n);
    });

    it("Should revert if no stake exists", async function () {
      await expect(stakingPool.connect(user1).unstake()).to.be.revertedWith(
        "No stake found"
      );
    });

    it("Should update total staked and stakers on unstake", async function () {
      const stakeAmount = ethers.parseEther("100");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Flexible);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
      expect(await stakingPool.totalStakers()).to.equal(1n);

      await stakingPool.connect(user1).unstake();

      expect(await stakingPool.totalStaked()).to.equal(0n);
      expect(await stakingPool.totalStakers()).to.equal(0n);
    });
  });

  describe("Rewards", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should accumulate rewards over time", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Gold);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const pendingRewards = await stakingPool.pendingRewards(user1.address);

      // Gold tier is 15% APY
      // Expected: 10000 * 0.15 * (30/365) = ~123 GREP
      const expectedRewards = (stakeAmount * 1500n * 30n) / (365n * 10000n);

      // Allow small tolerance for timing
      expect(pendingRewards).to.be.closeTo(expectedRewards, ethers.parseEther("1"));
    });

    it("Should allow claiming rewards", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Gold);

      // Fast forward 30 days
      await time.increase(30 * 24 * 60 * 60);

      const pendingBefore = await stakingPool.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0n);

      const balanceBefore = await grepToken.balanceOf(user1.address);
      await stakingPool.connect(user1).claimRewards();
      const balanceAfter = await grepToken.balanceOf(user1.address);

      // User should have received rewards
      expect(balanceAfter).to.be.gt(balanceBefore);

      // Pending rewards should be reset (or very small due to time passing)
      const pendingAfter = await stakingPool.pendingRewards(user1.address);
      expect(pendingAfter).to.be.lt(ethers.parseEther("0.01"));
    });

    it("Should emit RewardsClaimed event", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Gold);

      await time.increase(30 * 24 * 60 * 60);

      await expect(stakingPool.connect(user1).claimRewards())
        .to.emit(stakingPool, "RewardsClaimed");
    });

    it("Should track total claimed in stake info", async function () {
      const stakeAmount = ethers.parseEther("10000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Gold);

      await time.increase(30 * 24 * 60 * 60);

      await stakingPool.connect(user1).claimRewards();

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.totalClaimed).to.be.gt(0n);
    });
  });

  describe("Multipliers and Bonus Plays", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should return correct multiplier for each tier", async function () {
      // No stake = 1x (10000 basis points)
      expect(await stakingPool.getUserMultiplier(user1.address)).to.equal(10000n);

      // Stake at Flexible
      await stakingPool.connect(user1).stake(ethers.parseEther("100"), Tier.Flexible);
      expect(await stakingPool.getUserMultiplier(user1.address)).to.equal(
        TIER_MULTIPLIERS[1]
      );
    });

    it("Should return correct bonus plays for each tier", async function () {
      // No stake = 0 bonus plays
      expect(await stakingPool.getUserBonusPlays(user1.address)).to.equal(0n);

      // Stake at Diamond
      await stakingPool.connect(user1).stake(ethers.parseEther("50000"), Tier.Diamond);
      expect(await stakingPool.getUserBonusPlays(user1.address)).to.equal(TIER_BONUS_PLAYS[5]);
    });
  });

  describe("getStakeInfo", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should return complete stake info", async function () {
      const stakeAmount = ethers.parseEther("5000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      const info = await stakingPool.getStakeInfo(user1.address);

      expect(info.amount).to.equal(stakeAmount);
      expect(info.tier).to.equal(Tier.Silver);
      expect(info.stakedAt).to.be.gt(0n);
      expect(info.lockedUntil).to.be.gt(0n);
      expect(info.multiplier).to.equal(TIER_MULTIPLIERS[3]);
      expect(info.bonusPlays).to.equal(TIER_BONUS_PLAYS[3]);
    });

    it("Should return zero values for non-staker", async function () {
      const info = await stakingPool.getStakeInfo(user2.address);

      expect(info.amount).to.equal(0n);
      expect(info.tier).to.equal(Tier.None);
      expect(info.multiplier).to.equal(10000n); // Base 1x
      expect(info.bonusPlays).to.equal(0n);
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should auto-upgrade tier when staking more", async function () {
      // Start at Flexible
      await stakingPool.connect(user1).stake(ethers.parseEther("100"), Tier.Flexible);

      let info = await stakingPool.getStakeInfo(user1.address);
      expect(info.tier).to.equal(Tier.Flexible);

      // Add more to qualify for Silver (total 5100 GREP)
      await stakingPool.connect(user1).stake(ethers.parseEther("5000"), Tier.Silver);

      info = await stakingPool.getStakeInfo(user1.address);
      expect(info.tier).to.equal(Tier.Silver);
      expect(info.amount).to.equal(ethers.parseEther("5100"));
    });

    it("Should claim pending rewards when adding to stake", async function () {
      await stakingPool.connect(user1).stake(ethers.parseEther("1000"), Tier.Bronze);

      // Accumulate some rewards
      await time.increase(30 * 24 * 60 * 60);

      const pendingBefore = await stakingPool.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0n);

      const balanceBefore = await grepToken.balanceOf(user1.address);

      // Add more stake - should auto-claim (5000 is Silver tier minimum)
      const additionalStake = ethers.parseEther("5000");
      await stakingPool.connect(user1).stake(additionalStake, Tier.Silver);

      const balanceAfter = await grepToken.balanceOf(user1.address);

      // Balance change = rewards received - new stake amount
      // Should have received some rewards (net change + 5000 stake)
      const netChange = balanceAfter - balanceBefore + additionalStake;
      expect(netChange).to.be.closeTo(pendingBefore, ethers.parseEther("0.1"));
    });
  });
});
