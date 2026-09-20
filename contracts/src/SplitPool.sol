// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @notice Immutable revenue shares, initialized atomically by the factory on a minimal clone.
contract SplitPool {
    address[] public participants;
    mapping(address => uint16) public bps;
    bytes32 public termsHash;
    mapping(address => uint256) public totalWithdrawn;
    mapping(address => mapping(address => uint256)) public withdrawn;
    bool private initialized;

    error AlreadyInitialized();

    constructor() {
        initialized = true;
    }

    receive() external payable {}

    /// @notice Historical receipts, including direct transfers. address(0) denotes native ETH.
    function totalReceived(address token) public view returns (uint256) {
        uint256 balance = token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
        return balance + totalWithdrawn[token];
    }

    function releasable(address token, address account) public view returns (uint256) {
        return Math.mulDiv(totalReceived(token), bps[account], 10_000) - withdrawn[token][account];
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
