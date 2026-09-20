// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SplitPoolFuzzBase} from "./SplitPoolFuzz.t.sol";

contract SplitPoolDustTest is SplitPoolFuzzBase {
    function testFuzz_DustNeverExceedsParticipantsMinusOne(uint256 seed, uint8 participantCount, uint8 paymentRounds)
        public
    {
        _createPool(seed, participantCount);
        uint256 rounds = bound(paymentRounds, 1, 8);
        for (uint256 round; round < rounds; ++round) {
            for (uint256 a; a < assets.length; ++a) {
                seed = uint256(keccak256(abi.encode(seed, round, a)));
                _pay(assets[a], seed % 1e24);
                // Rotate the settlement order; residue is bounded after ALL claims.
                uint256 offset = seed % accounts.length;
                for (uint256 i; i < accounts.length; ++i) {
                    _withdraw(assets[a], (i + offset) % accounts.length);
                }
                assertLe(_balance(assets[a], address(pool)), accounts.length - 1);
            }
            _assertAccounting();
        }
    }
}
