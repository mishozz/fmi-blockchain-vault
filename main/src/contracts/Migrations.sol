// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IMigrations.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Migrations is IMigrations, Ownable {
    uint256 public override last_completed_migration;

    constructor() Ownable() {}

    function setCompleted(uint256 completed) public override onlyOwner {
        last_completed_migration = completed;
    }
}
