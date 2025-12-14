// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {GrepToken} from "../src/GrepToken.sol";

contract GrepTokenTest is Test {
    GrepToken public token;

    address public owner = makeAddr("owner");
    address public treasury = makeAddr("treasury");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    uint256 public constant MAX_SUPPLY = 500_000_000 * 10 ** 18;
    uint256 public constant MAX_WALLET = 10_000_000 * 10 ** 18;
    uint256 public constant MAX_TX = 2_500_000 * 10 ** 18;

    function setUp() public {
        vm.prank(owner);
        token = new GrepToken(treasury, owner);
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), MAX_SUPPLY);
        assertEq(token.balanceOf(treasury), MAX_SUPPLY);
    }

    function test_TokenMetadata() public view {
        assertEq(token.name(), "GrepCoin");
        assertEq(token.symbol(), "GREP");
        assertEq(token.decimals(), 18);
    }

    function test_InitialLimits() public view {
        assertEq(token.maxWalletAmount(), MAX_WALLET);
        assertEq(token.maxTransactionAmount(), MAX_TX);
        assertTrue(token.limitsEnabled());
    }

    function test_InitialExemptions() public view {
        assertTrue(token.isExempt(treasury));
        assertTrue(token.isExempt(owner));
        assertTrue(token.isExempt(address(0)));
    }

    function test_RevertOnZeroAddresses() public {
        vm.expectRevert(GrepToken.ZeroAddress.selector);
        new GrepToken(address(0), owner);

        vm.expectRevert(GrepToken.ZeroAddress.selector);
        new GrepToken(treasury, address(0));
    }

    /*//////////////////////////////////////////////////////////////
                            TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_TransferWithinLimits() public {
        uint256 amount = 1_000_000 * 10 ** 18; // 1M tokens

        vm.prank(treasury);
        token.transfer(alice, amount);

        assertEq(token.balanceOf(alice), amount);
    }

    function test_RevertTransferExceedsMaxTransaction() public {
        uint256 amount = MAX_TX + 1;

        // First transfer to a non-exempt address
        vm.prank(treasury);
        token.transfer(alice, MAX_TX);

        // Alice is not exempt, so this should fail
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(GrepToken.ExceedsMaxTransaction.selector, amount, MAX_TX)
        );
        token.transfer(bob, amount);
    }

    function test_RevertTransferExceedsMaxWallet() public {
        // Transfer just under max wallet to Alice
        vm.prank(treasury);
        token.transfer(alice, MAX_WALLET);

        // Try to send more - should fail
        vm.prank(treasury);
        token.transfer(bob, MAX_WALLET);

        // Bob tries to send to Alice who already has max
        uint256 smallAmount = 1 * 10 ** 18;
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                GrepToken.ExceedsMaxWallet.selector, alice, MAX_WALLET + smallAmount, MAX_WALLET
            )
        );
        token.transfer(alice, smallAmount);
    }

    function test_ExemptAddressCanExceedLimits() public {
        uint256 largeAmount = MAX_TX * 2;

        // Treasury is exempt, can send large amounts
        vm.prank(treasury);
        token.transfer(alice, MAX_WALLET);

        // Set alice as exempt
        vm.prank(owner);
        token.setExempt(alice, true);

        // Alice can now receive more
        vm.prank(treasury);
        token.transfer(alice, largeAmount);

        assertGt(token.balanceOf(alice), MAX_WALLET);
    }

    function test_DisabledLimitsAllowAnyTransfer() public {
        vm.prank(owner);
        token.setLimitsEnabled(false);

        uint256 largeAmount = MAX_TX * 2;

        vm.prank(treasury);
        token.transfer(alice, largeAmount);

        assertEq(token.balanceOf(alice), largeAmount);
    }

    /*//////////////////////////////////////////////////////////////
                              BURN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Burn() public {
        uint256 amount = 1_000_000 * 10 ** 18;

        vm.prank(treasury);
        token.transfer(alice, amount);

        uint256 burnAmount = 100_000 * 10 ** 18;
        vm.prank(alice);
        token.burn(burnAmount);

        assertEq(token.balanceOf(alice), amount - burnAmount);
        assertEq(token.totalSupply(), MAX_SUPPLY - burnAmount);
    }

    function test_BurnFrom() public {
        uint256 amount = 1_000_000 * 10 ** 18;
        uint256 burnAmount = 100_000 * 10 ** 18;

        vm.prank(treasury);
        token.transfer(alice, amount);

        vm.prank(alice);
        token.approve(bob, burnAmount);

        vm.prank(bob);
        token.burnFrom(alice, burnAmount);

        assertEq(token.balanceOf(alice), amount - burnAmount);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetExempt() public {
        assertFalse(token.isExempt(alice));

        vm.prank(owner);
        token.setExempt(alice, true);

        assertTrue(token.isExempt(alice));
    }

    function test_SetLimitsEnabled() public {
        assertTrue(token.limitsEnabled());

        vm.prank(owner);
        token.setLimitsEnabled(false);

        assertFalse(token.limitsEnabled());
    }

    function test_SetMaxWalletAmount() public {
        uint256 newMax = 20_000_000 * 10 ** 18;

        vm.prank(owner);
        token.setMaxWalletAmount(newMax);

        assertEq(token.maxWalletAmount(), newMax);
    }

    function test_SetMaxTransactionAmount() public {
        uint256 newMax = 5_000_000 * 10 ** 18;

        vm.prank(owner);
        token.setMaxTransactionAmount(newMax);

        assertEq(token.maxTransactionAmount(), newMax);
    }

    function test_RevertNonOwnerAdmin() public {
        vm.prank(alice);
        vm.expectRevert();
        token.setExempt(bob, true);

        vm.prank(alice);
        vm.expectRevert();
        token.setLimitsEnabled(false);
    }

    function test_RevertZeroMaxAmounts() public {
        vm.prank(owner);
        vm.expectRevert(GrepToken.InvalidAmount.selector);
        token.setMaxWalletAmount(0);

        vm.prank(owner);
        vm.expectRevert(GrepToken.InvalidAmount.selector);
        token.setMaxTransactionAmount(0);
    }

    /*//////////////////////////////////////////////////////////////
                            VOTING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Delegation() public {
        uint256 amount = 1_000_000 * 10 ** 18;

        vm.prank(treasury);
        token.transfer(alice, amount);

        // Self-delegate to activate voting power
        vm.prank(alice);
        token.delegate(alice);

        assertEq(token.getVotes(alice), amount);
    }

    function test_DelegateToOther() public {
        uint256 amount = 1_000_000 * 10 ** 18;

        vm.prank(treasury);
        token.transfer(alice, amount);

        vm.prank(alice);
        token.delegate(bob);

        assertEq(token.getVotes(bob), amount);
        assertEq(token.getVotes(alice), 0);
    }

    /*//////////////////////////////////////////////////////////////
                             FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_TransferWithinLimits(uint256 amount) public {
        amount = bound(amount, 1, MAX_TX);

        vm.prank(treasury);
        token.transfer(alice, amount);

        assertEq(token.balanceOf(alice), amount);
    }

    function testFuzz_Burn(uint256 burnAmount) public {
        uint256 balance = 1_000_000 * 10 ** 18;
        burnAmount = bound(burnAmount, 1, balance);

        vm.prank(treasury);
        token.transfer(alice, balance);

        vm.prank(alice);
        token.burn(burnAmount);

        assertEq(token.balanceOf(alice), balance - burnAmount);
    }
}
