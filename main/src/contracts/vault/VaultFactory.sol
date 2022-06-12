// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/vault/IVaultFactory.sol";
import "./VaultETH.sol";

contract VaultFactory is IVaultFactory {
    bytes private deploymentBytecode;

    constructor(bytes memory deploymentBytecode_) {
        deploymentBytecode = deploymentBytecode_;
    }

    function createVault(address asset)
        external
        override
        returns (address addr)
    {
        bytes memory bytecode = abi.encodePacked(
            deploymentBytecode,
            abi.encode(msg.sender, asset)
        );

        assembly {
            addr := create(0, add(bytecode, 0x20), mload(bytecode))
            if iszero(extcodesize(addr)) {
                returndatacopy(0, 0, returndatasize())
                revert(0, returndatasize())
            }
        }

        Ownable(addr).transferOwnership(msg.sender);
        return addr;
    }
}
