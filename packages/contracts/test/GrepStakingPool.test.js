const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("GrepStakingPool", function () {
  let grepToken;
  let stakingPool;
  let owner;
  let user1;
  let user2;

  // Tier enum - Updated for Real Yield Model
  const Tier = {
    None: 0n,
    Basic: 1n,
    Silver: 2n,
    Gold: 3n,
    Diamond: 4n,
  };

  // Tier requirements - Real Yield Model
  const TIER_MIN_STAKES = {
    1: ethers.parseEther("100"),    // Basic
    2: ethers.parseEther("1000"),   // Silver
    3: ethers.parseEther("5000"),   // Gold
    4: ethers.parseEther("25000"),  // Diamond
  };

  const TIER_LOCK_DURATIONS = {
    1: 0n,                           // Basic - no lock
    2: BigInt(7 * 24 * 60 * 60),    // Silver - 7 days
    3: BigInt(30 * 24 * 60 * 60),   // Gold - 30 days
    4: BigInt(90 * 24 * 60 * 60),   // Diamond - 90 days
  };

  const TIER_REWARD_WEIGHTS = {
    1: 100n,   // Basic - 1x
    2: 125n,   // Silver - 1.25x
    3: 150n,   // Gold - 1.5x
    4: 200n,   // Diamond - 2x
  };

  const TIER_BONUS_PLAYS = {
    1: 2n,
    2: 5n,
    3: 10n,
    4: 20n,
  };

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy GrepToken (500M fixed supply)
    const GrepToken = await ethers.getContractFactory("GrepToken");
    grepToken = await GrepToken.deploy();
    await grepToken.waitForDeployment();

    // Deploy StakingPool (Real Yield Model)
    const GrepStakingPool = await ethers.getContractFactory("GrepStakingPool");
    stakingPool = await GrepStakingPool.deploy(await grepToken.getAddress());
    await stakingPool.waitForDeployment();

    // Transfer tokens to users for testing
    await grepToken.transfer(user1.address, ethers.parseEther("100000"));
    await grepToken.transfer(user2.address, ethers.parseEther("100000"));
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await stakingPool.grepToken()).to.equal(await grepToken.getAddress());
    });

    it("Should initialize tier info correctly", async function () {
      const basicTier = await stakingPool.tierInfo(Tier.Basic);
      expect(basicTier.minStake).to.equal(TIER_MIN_STAKES[1]);
      expect(basicTier.lockDuration).to.equal(TIER_LOCK_DURATIONS[1]);
      expect(basicTier.rewardWeight).to.equal(TIER_REWARD_WEIGHTS[1]);

      const diamondTier = await stakingPool.tierInfo(Tier.Diamond);
      expect(diamondTier.minStake).to.equal(TIER_MIN_STAKES[4]);
      expect(diamondTier.lockDuration).to.equal(TIER_LOCK_DURATIONS[4]);
      expect(diamondTier.rewardWeight).to.equal(TIER_REWARD_WEIGHTS[4]);
    });

    it("Should start with zero total staked", async function () {
      expect(await stakingPool.totalStaked()).to.equal(0n);
      expect(await stakingPool.totalStakers()).to.equal(0n);
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should allow staking at Basic tier", async function () {
      const stakeAmount = ethers.parseEther("100");

      await expect(stakingPool.connect(user1).stake(stakeAmount, Tier.Basic))
        .to.emit(stakingPool, "Staked");

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Basic);
    });

    it("Should allow staking at Silver tier", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Silver);
    });

    it("Should allow staking at Diamond tier", async function () {
      const stakeAmount = ethers.parseEther("25000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Diamond);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(stakeAmount);
      expect(stakeInfo.tier).to.equal(Tier.Diamond);
    });

    it("Should reject staking below minimum for tier", async function () {
      const belowMin = ethers.parseEther("50"); // Below 100 GREP minimum

      await expect(
        stakingPool.connect(user1).stake(belowMin, Tier.Basic)
      ).to.be.revertedWith("Below minimum stake for tier");
    });

    it("Should reject staking with Tier.None", async function () {
      await expect(
        stakingPool.connect(user1).stake(ethers.parseEther("100"), Tier.None)
      ).to.be.revertedWith("Invalid tier");
    });

    it("Should update total staked and stakers count", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
      expect(await stakingPool.totalStakers()).to.equal(1n);

      // Second user stakes
      await grepToken.connect(user2).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
      await stakingPool.connect(user2).stake(stakeAmount, Tier.Silver);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount * 2n);
      expect(await stakingPool.totalStakers()).to.equal(2n);
    });

    it("Should set correct lock duration", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      const expectedLockEnd = BigInt(await time.latest()) + TIER_LOCK_DURATIONS[2];

      // Allow 2 second tolerance for block time
      expect(stakeInfo.lockedUntil).to.be.closeTo(expectedLockEnd, 2n);
    });
  });

  describe("Unstaking", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should allow unstaking after lock period (Basic)", async function () {
      const stakeAmount = ethers.parseEther("100");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Basic);

      // Basic has no lock, can unstake immediately
      const balanceBefore = await grepToken.balanceOf(user1.address);
      await stakingPool.connect(user1).unstake();
      const balanceAfter = await grepToken.balanceOf(user1.address);

      expect(balanceAfter - balanceBefore).to.equal(stakeAmount);

      const stakeInfo = await stakingPool.getStakeInfo(user1.address);
      expect(stakeInfo.amount).to.equal(0n);
    });

    it("Should allow unstaking after lock period (Silver)", async function () {
      const stakeAmount = ethers.parseEther("1000");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

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

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Basic);

      expect(await stakingPool.totalStaked()).to.equal(stakeAmount);
      expect(await stakingPool.totalStakers()).to.equal(1n);

      await stakingPool.connect(user1).unstake();

      expect(await stakingPool.totalStaked()).to.equal(0n);
      expect(await stakingPool.totalStakers()).to.equal(0n);
    });
  });

  describe("Real Yield Rewards", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
      await grepToken.connect(user2).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should allow adding rewards to pool", async function () {
      const rewardAmount = ethers.parseEther("1000");

      // Approve staking pool to receive rewards
      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);

      await expect(stakingPool.addRewards(rewardAmount))
        .to.emit(stakingPool, "RewardsAdded")
        .withArgs(rewardAmount, owner.address);
    });

    it("Should distribute rewards to stakers", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const rewardAmount = ethers.parseEther("100");

      // User1 stakes
      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      // Add rewards to pool
      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);
      await stakingPool.addRewards(rewardAmount);

      // Check pending rewards
      const pending = await stakingPool.pendingRewards(user1.address);
      expect(pending).to.be.gt(0n);
    });

    it("Should distribute rewards proportionally by weight", async function () {
      // User1 stakes at Basic (1x weight)
      await stakingPool.connect(user1).stake(ethers.parseEther("100"), Tier.Basic);

      // User2 stakes at Diamond (2x weight)
      await stakingPool.connect(user2).stake(ethers.parseEther("25000"), Tier.Diamond);

      // Add rewards
      const rewardAmount = ethers.parseEther("1000");
      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);
      await stakingPool.addRewards(rewardAmount);

      const pending1 = await stakingPool.pendingRewards(user1.address);
      const pending2 = await stakingPool.pendingRewards(user2.address);

      // User2 should have much more due to higher stake and weight
      expect(pending2).to.be.gt(pending1);
    });

    it("Should allow claiming rewards", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const rewardAmount = ethers.parseEther("100");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);
      await stakingPool.addRewards(rewardAmount);

      const pendingBefore = await stakingPool.pendingRewards(user1.address);
      expect(pendingBefore).to.be.gt(0n);

      const balanceBefore = await grepToken.balanceOf(user1.address);
      await stakingPool.connect(user1).claimRewards();
      const balanceAfter = await grepToken.balanceOf(user1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should emit RewardsClaimed event", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const rewardAmount = ethers.parseEther("100");

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Silver);

      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);
      await stakingPool.addRewards(rewardAmount);

      await expect(stakingPool.connect(user1).claimRewards())
        .to.emit(stakingPool, "RewardsClaimed");
    });
  });

  describe("Bonus Plays", function () {
    beforeEach(async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );
    });

    it("Should return correct bonus plays for each tier", async function () {
      // No stake = 0 bonus plays
      expect(await stakingPool.getUserBonusPlays(user1.address)).to.equal(0n);

      // Stake at Diamond
      await stakingPool.connect(user1).stake(ethers.parseEther("25000"), Tier.Diamond);
      expect(await stakingPool.getUserBonusPlays(user1.address)).to.equal(TIER_BONUS_PLAYS[4]);
    });

    it("Should return correct weight for each tier", async function () {
      // No stake = 1x (100)
      expect(await stakingPool.getUserWeight(user1.address)).to.equal(100n);

      // Stake at Gold
      await stakingPool.connect(user1).stake(ethers.parseEther("5000"), Tier.Gold);
      expect(await stakingPool.getUserWeight(user1.address)).to.equal(TIER_REWARD_WEIGHTS[3]);
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

      await stakingPool.connect(user1).stake(stakeAmount, Tier.Gold);

      const info = await stakingPool.getStakeInfo(user1.address);

      expect(info.amount).to.equal(stakeAmount);
      expect(info.tier).to.equal(Tier.Gold);
      expect(info.stakedAt).to.be.gt(0n);
      expect(info.lockedUntil).to.be.gt(0n);
      expect(info.rewardWeight).to.equal(TIER_REWARD_WEIGHTS[3]);
      expect(info.bonusPlays).to.equal(TIER_BONUS_PLAYS[3]);
    });

    it("Should return zero values for non-staker", async function () {
      const info = await stakingPool.getStakeInfo(user2.address);

      expect(info.amount).to.equal(0n);
      expect(info.tier).to.equal(Tier.None);
      expect(info.rewardWeight).to.equal(100n); // Base 1x
      expect(info.bonusPlays).to.equal(0n);
    });
  });

  describe("Pool Stats", function () {
    it("Should return correct pool stats", async function () {
      await grepToken.connect(user1).approve(
        await stakingPool.getAddress(),
        ethers.parseEther("100000")
      );

      await stakingPool.connect(user1).stake(ethers.parseEther("1000"), Tier.Silver);

      const rewardAmount = ethers.parseEther("500");
      await grepToken.approve(await stakingPool.getAddress(), rewardAmount);
      await stakingPool.addRewards(rewardAmount);

      await stakingPool.connect(user1).claimRewards();

      const [totalStaked, totalStakers, rewardPool, totalDistributed] =
        await stakingPool.getPoolStats();

      expect(totalStaked).to.equal(ethers.parseEther("1000"));
      expect(totalStakers).to.equal(1n);
      expect(totalDistributed).to.be.gt(0n);
    });
  });
});
