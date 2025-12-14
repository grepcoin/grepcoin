// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {GrepToken} from "../src/GrepToken.sol";
import {VestingVault} from "../src/VestingVault.sol";

contract VestingVaultTest is Test {
    GrepToken public token;
    VestingVault public vault;

    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 public constant VESTING_AMOUNT = 1_000_000 * 10 ** 18;
    uint256 public constant CLIFF = 365 days;
    uint256 public constant VESTING_DURATION = 3 * 365 days;

    function setUp() public {
        vm.startPrank(owner);

        // Deploy token
        token = new GrepToken(treasury, owner);

        // Deploy vesting vault
        vault = new VestingVault(address(token), owner);

        // Exempt vault from limits
        token.setExempt(address(vault), true);

        vm.stopPrank();

        // Fund vault with tokens
        vm.prank(treasury);
        token.transfer(address(vault), 100_000_000 * 10 ** 18);
    }

    /*//////////////////////////////////////////////////////////////
                         SCHEDULE CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateSchedule() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        VestingVault.VestingSchedule memory schedule = vault.getSchedule(scheduleId);

        assertEq(schedule.beneficiary, alice);
        assertEq(schedule.totalAmount, VESTING_AMOUNT);
        assertEq(schedule.cliffDuration, CLIFF);
        assertEq(schedule.vestingDuration, VESTING_DURATION);
        assertEq(schedule.tgeAmount, 0);
        assertTrue(schedule.revocable);
        assertFalse(schedule.revoked);
    }

    function test_CreateScheduleWithTGE() public {
        uint256 tgePercent = 10; // 10%
        uint256 expectedTge = (VESTING_AMOUNT * tgePercent) / 100;

        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, tgePercent, true);

        // TGE should be released immediately
        assertEq(token.balanceOf(alice), expectedTge);

        VestingVault.VestingSchedule memory schedule = vault.getSchedule(scheduleId);
        assertEq(schedule.released, expectedTge);
    }

    function test_RevertCreateScheduleZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(VestingVault.ZeroAddress.selector);
        vault.createSchedule(address(0), VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);
    }

    function test_RevertCreateScheduleZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(VestingVault.ZeroAmount.selector);
        vault.createSchedule(alice, 0, CLIFF, VESTING_DURATION, 0, true);
    }

    function test_RevertCreateScheduleZeroDuration() public {
        vm.prank(owner);
        vm.expectRevert(VestingVault.InvalidDuration.selector);
        vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, 0, 0, true);
    }

    function test_RevertCreateScheduleInsufficientBalance() public {
        uint256 hugeAmount = 1_000_000_000 * 10 ** 18;

        vm.prank(owner);
        vm.expectRevert(VestingVault.InsufficientBalance.selector);
        vault.createSchedule(alice, hugeAmount, CLIFF, VESTING_DURATION, 0, true);
    }

    /*//////////////////////////////////////////////////////////////
                            VESTING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_NothingVestedBeforeCliff() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Move time forward but not past cliff
        vm.warp(block.timestamp + CLIFF - 1);

        assertEq(vault.releasable(scheduleId), 0);
    }

    function test_LinearVestingAfterCliff() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Move past cliff + half of vesting duration
        vm.warp(block.timestamp + CLIFF + (VESTING_DURATION / 2));

        uint256 expected = VESTING_AMOUNT / 2;
        uint256 releasable = vault.releasable(scheduleId);

        // Allow 1 wei tolerance for rounding
        assertApproxEqAbs(releasable, expected, 1);
    }

    function test_FullyVestedAfterDuration() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Move past full vesting period
        vm.warp(block.timestamp + CLIFF + VESTING_DURATION + 1);

        assertEq(vault.releasable(scheduleId), VESTING_AMOUNT);
    }

    /*//////////////////////////////////////////////////////////////
                            RELEASE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Release() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Move past cliff + half vesting
        vm.warp(block.timestamp + CLIFF + (VESTING_DURATION / 2));

        uint256 expectedRelease = vault.releasable(scheduleId);

        vm.prank(alice);
        vault.release(scheduleId);

        assertApproxEqAbs(token.balanceOf(alice), expectedRelease, 1);
    }

    function test_ReleaseMultipleTimes() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // First release at cliff
        vm.warp(block.timestamp + CLIFF + (VESTING_DURATION / 4));
        vm.prank(alice);
        vault.release(scheduleId);
        uint256 firstRelease = token.balanceOf(alice);

        // Second release later
        vm.warp(block.timestamp + (VESTING_DURATION / 4));
        vm.prank(alice);
        vault.release(scheduleId);
        uint256 secondRelease = token.balanceOf(alice) - firstRelease;

        assertGt(secondRelease, 0);
    }

    function test_RevertReleaseNothingVested() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Before cliff
        vm.prank(alice);
        vm.expectRevert(VestingVault.NothingToRelease.selector);
        vault.release(scheduleId);
    }

    function test_ReleaseAll() public {
        // Create multiple schedules for alice
        vm.startPrank(owner);
        vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);
        vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);
        vm.stopPrank();

        // Move past full vesting
        vm.warp(block.timestamp + CLIFF + VESTING_DURATION + 1);

        vm.prank(alice);
        vault.releaseAll();

        assertEq(token.balanceOf(alice), VESTING_AMOUNT * 2);
    }

    /*//////////////////////////////////////////////////////////////
                            REVOKE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Revoke() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Move past cliff + 25% vesting
        vm.warp(block.timestamp + CLIFF + (VESTING_DURATION / 4));

        uint256 ownerBalanceBefore = token.balanceOf(owner);

        vm.prank(owner);
        vault.revoke(scheduleId);

        VestingVault.VestingSchedule memory schedule = vault.getSchedule(scheduleId);
        assertTrue(schedule.revoked);

        // Alice should have received vested amount
        assertGt(token.balanceOf(alice), 0);

        // Owner should have received unvested amount
        assertGt(token.balanceOf(owner), ownerBalanceBefore);
    }

    function test_RevertRevokeNonRevocable() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, false);

        vm.prank(owner);
        vm.expectRevert(VestingVault.NotRevocable.selector);
        vault.revoke(scheduleId);
    }

    function test_RevertRevokeAlreadyRevoked() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        vm.prank(owner);
        vault.revoke(scheduleId);

        vm.prank(owner);
        vm.expectRevert(VestingVault.AlreadyRevoked.selector);
        vault.revoke(scheduleId);
    }

    /*//////////////////////////////////////////////////////////////
                          BATCH CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateScheduleBatch() public {
        address[] memory beneficiaries = new address[](3);
        beneficiaries[0] = alice;
        beneficiaries[1] = bob;
        beneficiaries[2] = makeAddr("charlie");

        uint256[] memory amounts = new uint256[](3);
        amounts[0] = VESTING_AMOUNT;
        amounts[1] = VESTING_AMOUNT * 2;
        amounts[2] = VESTING_AMOUNT / 2;

        uint256[] memory cliffs = new uint256[](3);
        cliffs[0] = CLIFF;
        cliffs[1] = CLIFF / 2;
        cliffs[2] = CLIFF;

        uint256[] memory durations = new uint256[](3);
        durations[0] = VESTING_DURATION;
        durations[1] = VESTING_DURATION;
        durations[2] = VESTING_DURATION / 2;

        uint256[] memory tgePercents = new uint256[](3);
        tgePercents[0] = 0;
        tgePercents[1] = 10;
        tgePercents[2] = 5;

        vm.prank(owner);
        vault.createScheduleBatch(beneficiaries, amounts, cliffs, durations, tgePercents, true);

        assertEq(vault.scheduleCount(), 3);
    }

    /*//////////////////////////////////////////////////////////////
                             VIEW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetScheduleIds() public {
        vm.startPrank(owner);
        vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);
        vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);
        vm.stopPrank();

        uint256[] memory ids = vault.getScheduleIds(alice);
        assertEq(ids.length, 2);
    }

    function test_VestedAmount() public {
        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        // Before cliff
        assertEq(vault.vestedAmount(scheduleId), 0);

        // After full vesting
        vm.warp(block.timestamp + CLIFF + VESTING_DURATION + 1);
        assertEq(vault.vestedAmount(scheduleId), VESTING_AMOUNT);
    }

    /*//////////////////////////////////////////////////////////////
                             FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_VestingCalculation(uint256 timeElapsed) public {
        timeElapsed = bound(timeElapsed, 0, CLIFF + VESTING_DURATION + 365 days);

        vm.prank(owner);
        uint256 scheduleId = vault.createSchedule(alice, VESTING_AMOUNT, CLIFF, VESTING_DURATION, 0, true);

        vm.warp(block.timestamp + timeElapsed);

        uint256 vested = vault.vestedAmount(scheduleId);

        if (timeElapsed < CLIFF) {
            assertEq(vested, 0);
        } else if (timeElapsed >= CLIFF + VESTING_DURATION) {
            assertEq(vested, VESTING_AMOUNT);
        } else {
            assertGt(vested, 0);
            assertLt(vested, VESTING_AMOUNT);
        }
    }
}
