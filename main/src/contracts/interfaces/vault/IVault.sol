// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../../libraries/Errors.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IVault {
    struct Payment {
        uint256 amount;
        uint256 numberOfTransactions;
    }

    struct receiver {
        bool isWhiteListed;
        bool hasSigned;
    }

    event Recieved(address indexed sender, uint256 value);
    event WhitelistSet(address[] whitelist);
    event Sent(address indexed addr, uint256 value);
    event Withdrawn(uint256 value);

    function asset() external view returns (address);

    function contractSigned() external view returns (bool);

    function hasOwnerSigned() external view returns (bool);

    function currentAmount() external view returns (uint256);

    function whitelist(uint256 _index) external view returns (address);

    function isContractSigned() external view returns (bool);

    function setWhitelistAddresses(address[] memory _whitelist) external;

    function setPaymentDetails(
        address _receiver,
        uint256 _amount,
        uint256 _numberOfTransactions
    ) external;

    function receiverApprove() external;

    function ownerApprove() external;

    function createPaymentTo(address _receiver) external;

    function createPaymentToAll() external;

    function withdraw(uint256 amount) external;
}
