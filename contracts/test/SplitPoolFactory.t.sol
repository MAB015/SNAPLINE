// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {SplitPoolFactory} from "../src/SplitPoolFactory.sol";
import {SplitPool} from "../src/SplitPool.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract SplitPoolFactoryTest is Test {
    SplitPoolFactory internal factory;
    uint256[3] internal keys = [uint256(0xA11CE), uint256(0xB0B), uint256(0xCA401)];
    bytes32 internal constant AGREEMENT_TYPEHASH =
        keccak256("Agreement(address[] participants,uint16[] bps,bytes32 termsHash,bytes32 salt)");
    bytes32 internal constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    function setUp() public {
        factory = new SplitPoolFactory();
    }

    function test_CreateInitializesMinimalCloneAndEmitsAgreementHash() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        vm.recordLogs();
        // The submitter need not be a participant; signatures authorize the exact agreement.
        vm.prank(address(0xBEEF));
        address created = factory.createPool(agreement, signatures);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        assertEq(logs[0].emitter, address(factory));
        assertEq(logs[0].topics.length, 3);
        assertEq(logs[0].topics[0], keccak256("PoolCreated(address,bytes32)"));
        assertEq(logs[0].topics[1], bytes32(uint256(uint160(created))));
        assertEq(logs[0].topics[2], _structHash(agreement));
        assertEq(logs[0].data.length, 0);
        assertTrue(factory.consumed(_structHash(agreement)));
        bytes memory expectedRuntime =
            abi.encodePacked(hex"363d3d373d3d3d363d73", factory.implementation(), hex"5af43d82803e903d91602b57fd5bf3");
        assertEq(created.code, expectedRuntime);
        SplitPool pool = SplitPool(payable(created));
        assertEq(pool.termsHash(), agreement.termsHash);
        for (uint256 i; i < agreement.participants.length; ++i) {
            assertEq(pool.participants(i), agreement.participants[i]);
            assertEq(pool.bps(agreement.participants[i]), agreement.bps[i]);
        }
        vm.expectRevert(SplitPool.AlreadyInitialized.selector);
        pool.initialize(agreement.participants, agreement.bps, bytes32(0));
    }

    function test_FactoryImplementationCannotBeInitialized() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        SplitPool implementation = SplitPool(payable(factory.implementation()));
        vm.expectRevert(SplitPool.AlreadyInitialized.selector);
        implementation.initialize(agreement.participants, agreement.bps, agreement.termsHash);
    }

    function test_RejectsBpsBelow10000() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.bps[0] = 4_999;
        _reject(agreement, _sign(agreement, block.chainid, address(factory)), SplitPoolFactory.InvalidBps.selector);
    }

    function test_RejectsBpsAbove10000() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.bps[0] = 5_001;
        _reject(agreement, _sign(agreement, block.chainid, address(factory)), SplitPoolFactory.InvalidBps.selector);
    }

    function test_RejectsDuplicateParticipant() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.participants[2] = agreement.participants[0];
        _reject(
            agreement, _sign(agreement, block.chainid, address(factory)), SplitPoolFactory.InvalidParticipants.selector
        );
    }

    function test_RejectsZeroParticipant() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.participants[1] = address(0);
        _reject(
            agreement, _sign(agreement, block.chainid, address(factory)), SplitPoolFactory.InvalidParticipants.selector
        );
    }

    function test_RejectsEmptyParticipants() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.participants = new address[](0);
        agreement.bps = new uint16[](0);
        _reject(agreement, new bytes[](0), SplitPoolFactory.InvalidParticipants.selector);
    }

    function test_RejectsMismatchedArrayLengths() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        agreement.bps = new uint16[](2);
        agreement.bps[0] = 5_000;
        agreement.bps[1] = 5_000;
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        vm.expectRevert();
        factory.createPool(agreement, signatures);
        assertFalse(factory.consumed(_structHash(agreement)));
    }

    function test_RejectsMissingSignature() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory full = _sign(agreement, block.chainid, address(factory));
        bytes[] memory signatures = new bytes[](2);
        signatures[0] = full[0];
        signatures[1] = full[1];
        _reject(agreement, signatures, SplitPoolFactory.InvalidSignatures.selector);
    }

    function test_RejectsExtraSignature() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory full = _sign(agreement, block.chainid, address(factory));
        bytes[] memory signatures = new bytes[](4);
        for (uint256 i; i < full.length; ++i) {
            signatures[i] = full[i];
        }
        signatures[3] = full[0];
        _reject(agreement, signatures, SplitPoolFactory.InvalidSignatures.selector);
    }

    function test_RejectsSignatureFromNonparticipant() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        signatures[1] = _signature(0xBAD, _digest(agreement, block.chainid, address(factory)));
        _reject(agreement, signatures, SplitPoolFactory.InvalidSignatures.selector);
    }

    function test_RejectsSignaturesInWrongOrder() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        (signatures[0], signatures[2]) = (signatures[2], signatures[0]);
        _reject(agreement, signatures, SplitPoolFactory.InvalidSignatures.selector);
    }

    function test_RejectsMalformedSignatureWithoutConsumingAgreement() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        signatures[2] = hex"1234";
        vm.expectRevert();
        factory.createPool(agreement, signatures);
        assertFalse(factory.consumed(_structHash(agreement)));
        // A failed attempt must not burn the valid authorization.
        factory.createPool(agreement, _sign(agreement, block.chainid, address(factory)));
        assertTrue(factory.consumed(_structHash(agreement)));
    }

    function test_RejectsReusedSignaturePackage() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory signatures = _sign(agreement, block.chainid, address(factory));
        address created = factory.createPool(agreement, signatures);
        vm.expectRevert(SplitPoolFactory.AgreementAlreadyConsumed.selector);
        factory.createPool(agreement, signatures);
        assertTrue(factory.consumed(_structHash(agreement)));
        assertEq(SplitPool(payable(created)).termsHash(), agreement.termsHash);
    }

    function test_RejectsOtherChainDomain() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        _reject(
            agreement,
            _sign(agreement, block.chainid + 1, address(factory)),
            SplitPoolFactory.InvalidSignatures.selector
        );
    }

    function test_DomainTracksChangedChainId() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes[] memory oldSignatures = _sign(agreement, block.chainid, address(factory));
        vm.chainId(block.chainid + 1);
        _reject(agreement, oldSignatures, SplitPoolFactory.InvalidSignatures.selector);
        factory.createPool(agreement, _sign(agreement, block.chainid, address(factory)));
    }

    function test_RejectsOtherFactoryDomain() public {
        SplitPoolFactory other = new SplitPoolFactory();
        SplitPoolFactory.Agreement memory agreement = _agreement();
        _reject(agreement, _sign(agreement, block.chainid, address(other)), SplitPoolFactory.InvalidSignatures.selector);
    }

    function test_NewSaltWithNewSignaturesCreatesIndependentPool() public {
        SplitPoolFactory.Agreement memory agreement = _agreement();
        bytes32 firstHash = _structHash(agreement);
        address first = factory.createPool(agreement, _sign(agreement, block.chainid, address(factory)));
        agreement.salt = bytes32(uint256(2));
        address second = factory.createPool(agreement, _sign(agreement, block.chainid, address(factory)));
        assertNotEq(first, second);
        assertTrue(factory.consumed(firstHash));
        assertTrue(factory.consumed(_structHash(agreement)));
    }

    function _agreement() internal view returns (SplitPoolFactory.Agreement memory agreement) {
        agreement.participants = new address[](3);
        agreement.bps = new uint16[](3);
        for (uint256 i; i < keys.length; ++i) {
            agreement.participants[i] = vm.addr(keys[i]);
        }
        agreement.bps[0] = 5_000;
        agreement.bps[1] = 3_000;
        agreement.bps[2] = 2_000;
        agreement.termsHash = keccak256("project terms");
        agreement.salt = bytes32(uint256(1));
    }

    function _reject(SplitPoolFactory.Agreement memory agreement, bytes[] memory signatures, bytes4 selector) internal {
        vm.expectRevert(selector);
        factory.createPool(agreement, signatures);
        assertFalse(factory.consumed(_structHash(agreement)));
    }

    function _sign(SplitPoolFactory.Agreement memory agreement, uint256 chainId, address verifyingContract)
        internal
        view
        returns (bytes[] memory signatures)
    {
        bytes32 digest = _digest(agreement, chainId, verifyingContract);
        signatures = new bytes[](keys.length);
        for (uint256 i; i < keys.length; ++i) {
            signatures[i] = _signature(keys[i], digest);
        }
    }

    function _signature(uint256 key, bytes32 digest) internal pure returns (bytes memory) {
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _digest(SplitPoolFactory.Agreement memory agreement, uint256 chainId, address verifyingContract)
        internal
        pure
        returns (bytes32)
    {
        bytes32 domain = keccak256(
            abi.encode(DOMAIN_TYPEHASH, keccak256("SNAPLINE"), keccak256("1"), chainId, verifyingContract)
        );
        return keccak256(abi.encodePacked(hex"1901", domain, _structHash(agreement)));
    }

    function _structHash(SplitPoolFactory.Agreement memory agreement) internal pure returns (bytes32) {
        // Independent oracle: EIP-712 array elements occupy 32 bytes, including uint16 and address.
        bytes memory participantWords;
        bytes memory shareWords;
        for (uint256 i; i < agreement.participants.length; ++i) {
            participantWords = bytes.concat(participantWords, abi.encode(agreement.participants[i]));
        }
        for (uint256 i; i < agreement.bps.length; ++i) {
            shareWords = bytes.concat(shareWords, abi.encode(agreement.bps[i]));
        }
        return keccak256(
            abi.encode(
                AGREEMENT_TYPEHASH,
                keccak256(participantWords),
                keccak256(shareWords),
                agreement.termsHash,
                agreement.salt
            )
        );
    }
}
