// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./IVault.sol";

interface IVaultETH is IVault {
    function deposit() external payable;
}
