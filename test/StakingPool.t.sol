// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {GrepToken} from "../src/GrepToken.sol";
import {StakingPool} from "../src/StakingPool.sol";

contract StakingPoolTest is Test {
    GrepToken public token;
    StakingPool public staking;

    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 public constant STAKE_AMOUNT = 100_000 * 10 ** 18;
    uint256 public constant REWARD_POOL = 10_000_000 * 10 ** 18;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy token
        token = new GrepToken(treasury, owner);

        // Deploy staking pool
        staking = new StakingPool(address(token), treasury, owner);

        // Exempt staking pool from limits
        token.setExempt(address(staking), true);

        vm.stopPrank();

        // Fund users
        vm.startPrank(treasury);
        token.transfer(alice, STAKE_AMOUNT * 10);
        token.transfer(bob, STAKE_AMOUNT * 10);
        token.transfer(owner, REWARD_POOL * 2);
        vm.stopPrank();

        // Fund reward pool
        vm.startPrank(owner);
        token.approve(address(staking), REWARD_POOL);
        staking.addRewards(REWARD_POOL);
        vm.stopPrank();

        // Approve staking for users
        vm.prank(alice);
        token.approve(address(staking), type(uint256).max);

        vm.prank(bob);
        token.approve(address(staking), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                            STAKING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_StakeFlexible() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);

        assertEq(stakeData.amount, STAKE_AMOUNT);
        assertEq(uint8(stakeData.tier), uint8(StakingPool.Tier.Flexible));
        assertTrue(stakeData.active);
        assertEq(stakeData.lockEndTime, block.timestamp); // No lock
    }

    function test_StakeBronze() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertEq(stakeData.lockEndTime, block.timestamp + 30 days);
    }

    function test_StakeDiamond() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Diamond);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertEq(stakeData.lockEndTime, block.timestamp + 365 days);
    }

    function test_StakeUpdatesBalances() public {
        uint256 userBalanceBefore = token.balanceOf(alice);
        uint256 contractBalanceBefore = token.balanceOf(address(staking));

        vm.prank(alice);
        staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        assertEq(token.balanceOf(alice), userBalanceBefore - STAKE_AMOUNT);
        assertEq(token.balanceOf(address(staking)), contractBalanceBefore + STAKE_AMOUNT);
        assertEq(staking.totalStaked(), STAKE_AMOUNT);
        assertEq(staking.userTotalStaked(alice), STAKE_AMOUNT);
    }

    function test_RevertStakeZeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(StakingPool.ZeroAmount.selector);
        staking.stake(0, StakingPool.Tier.Flexible);
    }

    /*//////////////////////////////////////////////////////////////
                            REWARD TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RewardsAccrueOverTime() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        // Move forward 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 rewards = staking.pendingRewards(stakeId);

        // Expected: 5% APY on 100k = 5k
        uint256 expectedRewards = (STAKE_AMOUNT * 500) / 10000;

        assertApproxEqRel(rewards, expectedRewards, 0.01e18); // 1% tolerance
    }

    function test_HigherTierHigherRewards() public {
        vm.prank(alice);
        uint256 flexibleId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.prank(bob);
        uint256 diamondId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Diamond);

        // Move forward 1 year
        vm.warp(block.timestamp + 365 days);

        uint256 flexibleRewards = staking.pendingRewards(flexibleId);
        uint256 diamondRewards = staking.pendingRewards(diamondId);

        // Diamond (20%) should be 4x Flexible (5%)
        assertApproxEqRel(diamondRewards, flexibleRewards * 4, 0.01e18);
    }

    /*//////////////////////////////////////////////////////////////
                           UNSTAKE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_UnstakeFlexible() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        // Move forward for some rewards
        vm.warp(block.timestamp + 30 days);

        uint256 expectedRewards = staking.pendingRewards(stakeId);
        uint256 balanceBefore = token.balanceOf(alice);

        vm.prank(alice);
        staking.unstake(stakeId);

        uint256 balanceAfter = token.balanceOf(alice);
        assertApproxEqAbs(balanceAfter - balanceBefore, STAKE_AMOUNT + expectedRewards, 1);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertFalse(stakeData.active);
    }

    function test_RevertUnstakeBeforeLock() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);

        // Try to unstake before 30 day lock
        vm.warp(block.timestamp + 29 days);

        vm.prank(alice);
        vm.expectRevert(StakingPool.StakeLocked.selector);
        staking.unstake(stakeId);
    }

    function test_UnstakeAfterLock() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);

        // Move past lock period
        vm.warp(block.timestamp + 31 days);

        vm.prank(alice);
        staking.unstake(stakeId);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertFalse(stakeData.active);
    }

    function test_RevertUnstakeNotOwner() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.prank(bob);
        vm.expectRevert(StakingPool.NotStakeOwner.selector);
        staking.unstake(stakeId);
    }

    /*//////////////////////////////////////////////////////////////
                        CLAIM REWARDS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ClaimRewards() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.warp(block.timestamp + 30 days);

        uint256 expectedRewards = staking.pendingRewards(stakeId);
        uint256 balanceBefore = token.balanceOf(alice);

        vm.prank(alice);
        staking.claimRewards(stakeId);

        assertApproxEqAbs(token.balanceOf(alice) - balanceBefore, expectedRewards, 1);

        // Stake should still be active
        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertTrue(stakeData.active);
    }

    function test_RevertClaimZeroRewards() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        // Immediately try to claim (no time passed)
        vm.prank(alice);
        vm.expectRevert(StakingPool.ZeroAmount.selector);
        staking.claimRewards(stakeId);
    }

    /*//////////////////////////////////////////////////////////////
                      EMERGENCY WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_EmergencyWithdrawWithPenalty() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Diamond);

        // Emergency withdraw before lock ends
        uint256 treasuryBefore = token.balanceOf(treasury);

        vm.prank(alice);
        staking.emergencyWithdraw(stakeId);

        // Alice should get 50%
        assertEq(token.balanceOf(alice), (STAKE_AMOUNT * 10) - STAKE_AMOUNT + (STAKE_AMOUNT / 2));

        // Treasury should get 50% penalty
        assertEq(token.balanceOf(treasury) - treasuryBefore, STAKE_AMOUNT / 2);
    }

    function test_EmergencyWithdrawNoPenaltyAfterLock() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);

        // Move past lock
        vm.warp(block.timestamp + 31 days);

        uint256 treasuryBefore = token.balanceOf(treasury);

        vm.prank(alice);
        staking.emergencyWithdraw(stakeId);

        // No penalty after lock
        assertEq(token.balanceOf(treasury), treasuryBefore);
    }

    /*//////////////////////////////////////////////////////////////
                          COMPOUND TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Compound() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.warp(block.timestamp + 30 days);

        uint256 rewards = staking.pendingRewards(stakeId);

        vm.prank(alice);
        staking.compound(stakeId);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertApproxEqAbs(stakeData.amount, STAKE_AMOUNT + rewards, 1);
    }

    /*//////////////////////////////////////////////////////////////
                           ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_AddRewards() public {
        uint256 additionalRewards = 1_000_000 * 10 ** 18;
        uint256 rewardPoolBefore = staking.rewardPool();

        vm.startPrank(owner);
        token.approve(address(staking), additionalRewards);
        staking.addRewards(additionalRewards);
        vm.stopPrank();

        assertEq(staking.rewardPool(), rewardPoolBefore + additionalRewards);
    }

    function test_SetTreasury() public {
        address newTreasury = makeAddr("newTreasury");

        vm.prank(owner);
        staking.setTreasury(newTreasury);

        assertEq(staking.treasury(), newTreasury);
    }

    function test_SetTierConfig() public {
        vm.prank(owner);
        staking.setTierConfig(StakingPool.Tier.Flexible, 7 days, 600); // 6% with 7 day lock

        StakingPool.TierConfig memory config = staking.getTierConfig(StakingPool.Tier.Flexible);
        assertEq(config.lockDuration, 7 days);
        assertEq(config.apyBps, 600);
    }

    function test_PauseUnpause() public {
        vm.prank(owner);
        staking.pause();

        vm.prank(alice);
        vm.expectRevert();
        staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.prank(owner);
        staking.unpause();

        vm.prank(alice);
        staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetUserStakes() public {
        vm.startPrank(alice);
        staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);
        staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);
        vm.stopPrank();

        uint256[] memory stakes = staking.getUserStakes(alice);
        assertEq(stakes.length, 2);
    }

    function test_IsUnlocked() public {
        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Bronze);

        assertFalse(staking.isUnlocked(stakeId));

        vm.warp(block.timestamp + 31 days);

        assertTrue(staking.isUnlocked(stakeId));
    }

    /*//////////////////////////////////////////////////////////////
                             FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_StakeAmount(uint256 amount) public {
        amount = bound(amount, 1, STAKE_AMOUNT * 5);

        vm.prank(alice);
        uint256 stakeId = staking.stake(amount, StakingPool.Tier.Flexible);

        StakingPool.Stake memory stakeData = staking.getStake(stakeId);
        assertEq(stakeData.amount, amount);
    }

    function testFuzz_RewardCalculation(uint256 timeElapsed) public {
        timeElapsed = bound(timeElapsed, 1, 365 days * 5);

        vm.prank(alice);
        uint256 stakeId = staking.stake(STAKE_AMOUNT, StakingPool.Tier.Flexible);

        vm.warp(block.timestamp + timeElapsed);

        uint256 rewards = staking.pendingRewards(stakeId);

        // Rewards should be proportional to time
        uint256 expectedRewards = (STAKE_AMOUNT * 500 * timeElapsed) / (10000 * 365 days);
        assertApproxEqRel(rewards, expectedRewards, 0.01e18);
    }
}
