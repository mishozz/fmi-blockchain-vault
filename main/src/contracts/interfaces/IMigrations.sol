// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IMigrations {
    function last_completed_migration() external view returns (uint256);

    function setCompleted(uint256 completed) external;
}
