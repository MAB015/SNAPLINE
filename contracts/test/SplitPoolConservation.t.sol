// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SplitPoolFuzzBase} from "./SplitPoolFuzz.t.sol";

contract SplitPoolConservationTest is SplitPoolFuzzBase {
    function testFuzz_WithdrawalsNeverExceedReceiptsInAnyOrder(
        uint256 seed,
        uint8 participantCount,
        uint8 operationCount
    ) public {
        _createPool(seed, participantCount);
        // Every run exercises native funds and two independent token ledgers.
        for (uint256 a; a < assets.length; ++a) {
            _pay(assets[a], a + 1);
        }
        _assertAccounting();

        uint256 operations = bound(operationCount, 1, 32);
        for (uint256 i; i < operations; ++i) {
            seed = uint256(keccak256(abi.encode(seed, i)));
            address asset = assets[seed % assets.length];
            if ((seed >> 8) % 2 == 0) {
                _pay(asset, (seed >> 16) % 1e24);
            } else {
                _withdraw(asset, (seed >> 16) % accounts.length);
            }
            _assertAccounting();
        }

        for (uint256 a; a < assets.length; ++a) {
            for (uint256 i; i < accounts.length; ++i) {
                _withdraw(assets[a], i);
                _assertAccounting();
            }
            assertLe(_balance(assets[a], address(pool)), accounts.length - 1);
        }
    }
}
