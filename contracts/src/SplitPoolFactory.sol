// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SplitPool} from "./SplitPool.sol";

/// @notice Creates a revenue pool after every participant signs the same agreement.
contract SplitPoolFactory is EIP712 {
    struct Agreement {
        address[] participants;
        uint16[] bps;
        bytes32 termsHash;
        bytes32 salt;
    }

    bytes32 private constant AGREEMENT_TYPEHASH =
        keccak256("Agreement(address[] participants,uint16[] bps,bytes32 termsHash,bytes32 salt)");

    address public immutable implementation;
    mapping(bytes32 => bool) public consumed;

    error InvalidParticipants();
    error InvalidBps();
    error InvalidSignatures();
    error AgreementAlreadyConsumed();

    event PoolCreated(address indexed pool, bytes32 indexed structHash);

    constructor() EIP712("SNAPLINE", "1") {
        implementation = address(new SplitPool());
    }

    function createPool(Agreement calldata agreement, bytes[] calldata signatures) external returns (address pool) {
        uint256 count = agreement.participants.length;
        if (count == 0) revert InvalidParticipants();
        if (agreement.bps.length != count) revert InvalidBps();

        uint256 totalBps = 0;
        for (uint256 i; i < count; ++i) {
            address participant = agreement.participants[i];
            if (participant == address(0)) revert InvalidParticipants();
            for (uint256 j; j < i; ++j) {
                if (agreement.participants[j] == participant) revert InvalidParticipants();
            }
            totalBps += agreement.bps[i];
        }
        if (totalBps != 10_000) revert InvalidBps();
        if (signatures.length != count) revert InvalidSignatures();

        // Packed array encoding pads each address/uint16 element to 32 bytes.
        // Hash arrays separately to preserve the EIP-712 field boundaries.
        bytes32 structHash = keccak256(
            abi.encode(
                AGREEMENT_TYPEHASH,
                keccak256(abi.encodePacked(agreement.participants)),
                keccak256(abi.encodePacked(agreement.bps)),
                agreement.termsHash,
                agreement.salt
            )
        );
        if (consumed[structHash]) revert AgreementAlreadyConsumed();

        bytes32 digest = _hashTypedDataV4(structHash);
        for (uint256 i; i < count; ++i) {
            if (ECDSA.recover(digest, signatures[i]) != agreement.participants[i]) {
                revert InvalidSignatures();
            }
        }

        consumed[structHash] = true;
        pool = Clones.clone(implementation);
        SplitPool(payable(pool)).initialize(agreement.participants, agreement.bps, agreement.termsHash);
        emit PoolCreated(pool, structHash);
    }
}
