// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {MockUSDT} from "../src/MockUSDT.sol";
import {SplitPool} from "../src/SplitPool.sol";

contract SplitPoolTest is Test {
    SplitPool internal implementation;
    SplitPool internal pool;
    MockUSDT internal token;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal carol = address(0xCA401);
    address internal payer = address(0xBEEF);
    bytes32 internal constant TERMS = keccak256("project terms");

    function setUp() public {
        vm.deal(alice, 0);
        vm.deal(bob, 0);
        vm.deal(carol, 0);
        implementation = new SplitPool();
        pool = _newPool(alice, bob, carol);
        token = new MockUSDT();
        vm.deal(payer, 100 ether);
    }

    function test_InitializeCloneOncePreservesAgreement() public {
        (address[] memory accounts, uint16[] memory shares) = _agreement(alice, bob, carol);
        vm.expectRevert(SplitPool.AlreadyInitialized.selector);
        pool.initialize(accounts, shares, keccak256("replacement terms"));
        assertEq(pool.termsHash(), TERMS);
        for (uint256 i; i < accounts.length; ++i) {
            assertEq(pool.participants(i), accounts[i]);
            assertEq(pool.bps(accounts[i]), shares[i]);
        }
    }

    function test_ImplementationCannotInitialize() public {
        (address[] memory accounts, uint16[] memory shares) = _agreement(alice, bob, carol);
        vm.expectRevert(SplitPool.AlreadyInitialized.selector);
        implementation.initialize(accounts, shares, TERMS);
    }

    function test_ExactSplitWithNoReturnToken() public {
        _payToken(token, 1_000e6);
        assertEq(pool.totalReceived(address(token)), 1_000e6);
        _withdraw(address(token), carol, 200e6);
        _withdraw(address(token), alice, 500e6);
        _withdraw(address(token), bob, 300e6);
        assertEq(token.balanceOf(carol), 200e6);
        assertEq(token.balanceOf(alice), 500e6);
        assertEq(token.balanceOf(bob), 300e6);
        assertEq(token.balanceOf(address(pool)), 0);
        assertEq(pool.totalReceived(address(token)), 1_000e6);
        assertEq(pool.totalWithdrawn(address(token)), 1_000e6);
    }

    function test_LargeReceiptDoesNotOverflowIntermediateProduct() public {
        uint256 amount = type(uint256).max;
        _payToken(token, amount);
        uint256 aliceDue = amount / 10_000 * 5_000 + amount % 10_000 * 5_000 / 10_000;
        uint256 bobDue = amount / 10_000 * 3_000 + amount % 10_000 * 3_000 / 10_000;
        uint256 carolDue = amount / 10_000 * 2_000 + amount % 10_000 * 2_000 / 10_000;
        _withdraw(address(token), alice, aliceDue);
        _withdraw(address(token), bob, bobDue);
        _withdraw(address(token), carol, carolDue);
        assertEq(pool.totalReceived(address(token)), amount);
        assertLe(token.balanceOf(address(pool)), 2);
    }

    function test_ExactNativeSplit() public {
        _payNative(10 ether);
        _withdraw(address(0), bob, 3 ether);
        _withdraw(address(0), carol, 2 ether);
        _withdraw(address(0), alice, 5 ether);
        assertEq(alice.balance, 5 ether);
        assertEq(bob.balance, 3 ether);
        assertEq(carol.balance, 2 ether);
        assertEq(address(pool).balance, 0);
        assertEq(pool.totalReceived(address(0)), 10 ether);
        assertEq(pool.totalWithdrawn(address(0)), 10 ether);
    }

    function test_SecondTokenPaymentOnlyAddsNewEntitlement() public {
        _payToken(token, 1_000e6);
        _withdraw(address(token), alice, 500e6);
        _withdraw(address(token), bob, 300e6);
        _payToken(token, 400e6);
        _withdraw(address(token), bob, 120e6);
        _withdraw(address(token), alice, 200e6);
        // Carol did not claim the first payment; both entitlements remain available.
        _withdraw(address(token), carol, 280e6);
        assertEq(token.balanceOf(alice), 700e6);
        assertEq(token.balanceOf(bob), 420e6);
        assertEq(token.balanceOf(carol), 280e6);
        assertEq(pool.totalReceived(address(token)), 1_400e6);
        assertEq(pool.totalWithdrawn(address(token)), 1_400e6);
        assertEq(token.balanceOf(address(pool)), 0);
    }

    function test_SecondNativePaymentOnlyAddsNewEntitlement() public {
        _payNative(10 ether);
        _withdraw(address(0), alice, 5 ether);
        _withdraw(address(0), carol, 2 ether);
        _payNative(4 ether);
        _withdraw(address(0), carol, 0.8 ether);
        _withdraw(address(0), bob, 4.2 ether);
        _withdraw(address(0), alice, 2 ether);
        assertEq(alice.balance, 7 ether);
        assertEq(bob.balance, 4.2 ether);
        assertEq(carol.balance, 2.8 ether);
        assertEq(pool.totalReceived(address(0)), 14 ether);
        assertEq(pool.totalWithdrawn(address(0)), 14 ether);
        assertEq(address(pool).balance, 0);
    }

    function test_DoubleWithdrawalReturnsZeroForEachAsset() public {
        _payToken(token, 1_000e6);
        _payNative(10 ether);
        _withdraw(address(token), alice, 500e6);
        _withdraw(address(0), alice, 5 ether);
        _withdraw(address(token), alice, 0);
        _withdraw(address(0), alice, 0);
        assertEq(token.balanceOf(alice), 500e6);
        assertEq(alice.balance, 5 ether);
        assertEq(pool.withdrawn(address(token), alice), 500e6);
        assertEq(pool.withdrawn(address(0), alice), 5 ether);
        assertEq(pool.totalWithdrawn(address(token)), 500e6);
        assertEq(pool.totalWithdrawn(address(0)), 5 ether);
    }

    function test_TwoTokensAndNativeKeepIndependentLedgers() public {
        MockUSDT second = new MockUSDT();
        _payToken(token, 1_000e6);
        _payToken(second, 70e6);
        _payNative(10 ether);
        _withdraw(address(token), alice, 500e6);
        _withdraw(address(second), bob, 21e6);
        _withdraw(address(0), carol, 2 ether);
        assertEq(pool.totalWithdrawn(address(token)), 500e6);
        assertEq(pool.totalWithdrawn(address(second)), 21e6);
        assertEq(pool.totalWithdrawn(address(0)), 2 ether);
        assertEq(pool.withdrawn(address(second), alice), 0);
        assertEq(pool.withdrawn(address(0), alice), 0);
        assertEq(pool.withdrawn(address(token), bob), 0);
        _withdraw(address(second), alice, 35e6);
        _withdraw(address(0), alice, 5 ether);
        _withdraw(address(token), bob, 300e6);
        _withdraw(address(0), bob, 3 ether);
        _withdraw(address(token), carol, 200e6);
        _withdraw(address(second), carol, 14e6);
        assertEq(token.balanceOf(address(pool)), 0);
        assertEq(second.balanceOf(address(pool)), 0);
        assertEq(address(pool).balance, 0);
        assertEq(pool.totalReceived(address(token)), 1_000e6);
        assertEq(pool.totalReceived(address(second)), 70e6);
        assertEq(pool.totalReceived(address(0)), 10 ether);
    }

    function test_ReentrantReceiverCannotWithdrawMoreThanItsShare() public {
        ReentrantReceiver receiver = new ReentrantReceiver();
        pool = _newPool(address(receiver), bob, carol);
        _payNative(10 ether);
        assertEq(receiver.claim(pool), 5 ether);
        assertTrue(receiver.attempted());
        assertEq(receiver.reenteredAmount(), 0);
        assertEq(receiver.observedWithdrawn(), 5 ether);
        assertEq(receiver.observedTotalWithdrawn(), 5 ether);
        assertEq(address(receiver).balance, 5 ether);
        assertEq(pool.withdrawn(address(0), address(receiver)), 5 ether);
        _withdraw(address(0), bob, 3 ether);
        _withdraw(address(0), carol, 2 ether);
        assertEq(address(pool).balance, 0);
        assertEq(pool.totalWithdrawn(address(0)), 10 ether);
    }

    function test_ForcedEtherIsIncludedInHistoricalReceipts() public {
        _payNative(10 ether);
        _withdraw(address(0), alice, 5 ether);
        vm.deal(address(this), 4 ether);
        new ForcedEther{value: 4 ether}(payable(address(pool)));
        assertEq(pool.totalReceived(address(0)), 14 ether);
        _withdraw(address(0), alice, 2 ether);
        _withdraw(address(0), bob, 4.2 ether);
        _withdraw(address(0), carol, 2.8 ether);
        assertEq(alice.balance, 7 ether);
        assertEq(address(pool).balance, 0);
        assertEq(pool.totalWithdrawn(address(0)), 14 ether);
    }

    function _newPool(address first, address second, address third) internal returns (SplitPool result) {
        result = SplitPool(payable(Clones.clone(address(implementation))));
        (address[] memory accounts, uint16[] memory shares) = _agreement(first, second, third);
        result.initialize(accounts, shares, TERMS);
    }

    function _agreement(address first, address second, address third)
        internal
        pure
        returns (address[] memory accounts, uint16[] memory shares)
    {
        accounts = new address[](3);
        accounts[0] = first;
        accounts[1] = second;
        accounts[2] = third;
        shares = new uint16[](3);
        shares[0] = 5_000;
        shares[1] = 3_000;
        shares[2] = 2_000;
    }

    function _payToken(MockUSDT asset, uint256 amount) internal {
        asset.mint(payer, amount);
        vm.prank(payer);
        asset.transfer(address(pool), amount);
    }

    function _payNative(uint256 amount) internal {
        vm.prank(payer);
        (bool success,) = address(pool).call{value: amount}("");
        assertTrue(success);
    }

    function _withdraw(address asset, address account, uint256 expected) internal {
        assertEq(pool.releasable(asset, account), expected);
        vm.prank(account);
        assertEq(pool.withdraw(asset), expected);
        assertEq(pool.releasable(asset, account), 0);
    }
}

contract ReentrantReceiver {
    SplitPool internal pool;
    bool public attempted;
    uint256 public reenteredAmount;
    uint256 public observedWithdrawn;
    uint256 public observedTotalWithdrawn;

    function claim(SplitPool target) external returns (uint256) {
        pool = target;
        return target.withdraw(address(0));
    }

    receive() external payable {
        if (!attempted) {
            attempted = true;
            observedWithdrawn = pool.withdrawn(address(0), address(this));
            observedTotalWithdrawn = pool.totalWithdrawn(address(0));
            reenteredAmount = pool.withdraw(address(0));
        }
    }
}

contract ForcedEther {
    constructor(address payable target) payable {
        selfdestruct(target);
    }
}
