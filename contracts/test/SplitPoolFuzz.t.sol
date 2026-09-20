// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {MockUSDT} from "../src/MockUSDT.sol";
import {SplitPool} from "../src/SplitPool.sol";

abstract contract SplitPoolFuzzBase is Test {
    SplitPool internal pool;
    address[] internal accounts;
    uint16[] internal shares;
    address[3] internal assets;
    address internal payer = address(0xBEEF);

    // Independent ledger: only test payments and observed payouts update it.
    mapping(address => uint256) internal received;
    mapping(address => mapping(address => uint256)) internal paid;

    function _createPool(uint256 seed, uint8 participantCount) internal {
        uint256 count = bound(participantCount, 1, 10);
        uint256 remaining = 10_000;
        for (uint256 i; i < count; ++i) {
            address account = address(uint160(0x10000 + i));
            accounts.push(account);
            vm.deal(account, 0);
            seed = uint256(keccak256(abi.encode(seed, i)));
            uint256 share = i + 1 == count ? remaining : seed % (remaining + 1);
            shares.push(uint16(share));
            remaining -= share;
        }
        pool = SplitPool(payable(Clones.clone(address(new SplitPool()))));
        pool.initialize(accounts, shares, keccak256("fuzz terms"));
        assets[0] = address(0);
        assets[1] = address(new MockUSDT());
        assets[2] = address(new MockUSDT());
        vm.deal(payer, 1e30);
    }

    function _pay(address asset, uint256 amount) internal {
        if (asset == address(0)) {
            vm.prank(payer);
            (bool success,) = address(pool).call{value: amount}("");
            assertTrue(success);
        } else {
            MockUSDT(asset).mint(payer, amount);
            vm.prank(payer);
            MockUSDT(asset).transfer(address(pool), amount);
        }
        received[asset] += amount;
    }

    function _withdraw(address asset, uint256 index) internal {
        address account = accounts[index];
        uint256 expected = received[asset] * shares[index] / 10_000 - paid[asset][account];
        uint256 beforeBalance = _balance(asset, account);
        vm.prank(account);
        uint256 amount = pool.withdraw(asset);
        assertEq(amount, expected);
        assertEq(_balance(asset, account) - beforeBalance, expected);
        paid[asset][account] += amount;
    }

    function _assertAccounting() internal view {
        for (uint256 a; a < assets.length; ++a) {
            address asset = assets[a];
            uint256 totalPaid;
            for (uint256 i; i < accounts.length; ++i) {
                address account = accounts[i];
                uint256 entitlement = received[asset] * shares[i] / 10_000;
                uint256 payout = paid[asset][account];
                assertLe(payout, entitlement);
                assertEq(pool.withdrawn(asset, account), payout);
                assertEq(_balance(asset, account), payout);
                assertEq(pool.releasable(asset, account), entitlement - payout);
                totalPaid += payout;
            }
            assertLe(totalPaid, received[asset]);
            assertEq(pool.totalWithdrawn(asset), totalPaid);
            assertEq(pool.totalReceived(asset), received[asset]);
            assertEq(_balance(asset, address(pool)) + totalPaid, received[asset]);
        }
    }

    function _balance(address asset, address account) internal view returns (uint256) {
        return asset == address(0) ? account.balance : MockUSDT(asset).balanceOf(account);
    }
}
