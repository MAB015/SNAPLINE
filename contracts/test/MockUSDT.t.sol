// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract MockUSDTTest is Test {
    function test_PublicFaucetAndTransferReturnsNoData() public {
        MockUSDT token = new MockUSDT();
        address payer = makeAddr("payer");
        address receiver = makeAddr("receiver");
        vm.prank(payer);
        token.mint(payer, 1_000_000);
        assertEq(token.decimals(), 6);
        vm.prank(payer);
        (bool ok, bytes memory result) = address(token).call(abi.encodeCall(token.transfer, (receiver, 600_000)));
        assertTrue(ok);
        assertEq(result.length, 0);
        assertEq(token.balanceOf(receiver), 600_000);
        assertEq(token.balanceOf(payer), 400_000);
        assertEq(token.totalSupply(), 1_000_000);
    }

    function test_TransferFromConsumesAllowance() public {
        MockUSDT token = new MockUSDT();
        address spender = makeAddr("spender");
        token.mint(address(this), 10);
        token.approve(spender, 7);
        vm.prank(spender);
        token.transferFrom(address(this), spender, 7);
        assertEq(token.allowance(address(this), spender), 0);
        assertEq(token.balanceOf(spender), 7);
        vm.prank(spender);
        vm.expectRevert(MockUSDT.InsufficientAllowance.selector);
        token.transferFrom(address(this), spender, 1);
    }
}
