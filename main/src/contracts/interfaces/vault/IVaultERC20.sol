// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IVault.sol";

interface IVaultERC20 is IVault {
    function deposit(uint256 amount) external;
}
