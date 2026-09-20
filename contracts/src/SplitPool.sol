// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @notice Immutable revenue shares, initialized atomically by the factory on a minimal clone.
contract SplitPool {
    address[] public participants;
    mapping(address => uint16) public bps;
    bytes32 public termsHash;
    bool private initialized;

    error AlreadyInitialized();

    constructor() {
        initialized = true;
    }

    /// @dev The factory must validate nonzero unique participants, matching lengths and sum 10000.
    ///      Creation and initialization must happen in the same transaction.
    function initialize(address[] calldata accounts, uint16[] calldata shares, bytes32 termsHash_) external {
        if (initialized) revert AlreadyInitialized();
        initialized = true;
        termsHash = termsHash_;
        for (uint256 i; i < accounts.length; ++i) {
            participants.push(accounts[i]);
            bps[accounts[i]] = shares[i];
        }
    }
}
