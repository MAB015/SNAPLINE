// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {SplitPool} from "../src/SplitPool.sol";

contract SplitPoolReceiverTest is Test {
    SplitPool internal pool;
    RejectingReceiver internal receiver;
    address internal bob = address(0xB0B);
    address internal carol = address(0xCA401);

    function setUp() public {
        vm.deal(bob, 0);
        vm.deal(carol, 0);
        receiver = new RejectingReceiver();
        pool = SplitPool(payable(Clones.clone(address(new SplitPool()))));
        address[] memory accounts = new address[](3);
        accounts[0] = address(receiver);
        accounts[1] = bob;
        accounts[2] = carol;
        uint16[] memory shares = new uint16[](3);
        shares[0] = 5_000;
        shares[1] = 3_000;
        shares[2] = 2_000;
        pool.initialize(accounts, shares, keccak256("project terms"));
        vm.deal(address(this), 10 ether);
        (bool success,) = address(pool).call{value: 10 ether}("");
        assertTrue(success);
    }

    function test_RevertingReceiverRollsBackAndDoesNotBlockOthers() public {
        vm.expectRevert(SplitPool.NativeTransferFailed.selector);
        receiver.claim(pool);
        assertEq(pool.withdrawn(address(0), address(receiver)), 0);
        assertEq(pool.totalWithdrawn(address(0)), 0);
        assertEq(pool.releasable(address(0), address(receiver)), 5 ether);
        assertEq(address(pool).balance, 10 ether);
        vm.prank(bob);
        assertEq(pool.withdraw(address(0)), 3 ether);
        vm.prank(carol);
        assertEq(pool.withdraw(address(0)), 2 ether);
        assertEq(bob.balance, 3 ether);
        assertEq(carol.balance, 2 ether);
        receiver.acceptPayments();
        assertEq(receiver.claim(pool), 5 ether);
        assertEq(address(receiver).balance, 5 ether);
        assertEq(pool.totalWithdrawn(address(0)), 10 ether);
        assertEq(address(pool).balance, 0);
    }
}

contract RejectingReceiver {
    bool internal rejecting = true;

    function acceptPayments() external {
        rejecting = false;
    }

    function claim(SplitPool pool) external returns (uint256) {
        return pool.withdraw(address(0));
    }

    receive() external payable {
        require(!rejecting, "reject payment");
    }
}
