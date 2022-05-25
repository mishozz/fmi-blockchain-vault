// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IVault {
    struct Payment {
        uint256 amount;
        uint256 numberOfTransactions;
    }

    struct Reciever {
        bool isWhiteListed;
        bool hasSigned;
    }

    event Recieved(address indexed sender, uint256 value);
    event WhitelistSet(address[] whitelist);
    event Sent(address indexed addr, uint256 value);
    event Withdrawn(uint256 value);

    function contractSigned() external view returns (bool);

    function hasOwnerSigned() external view returns (bool);

    function whiteListLength() external view returns (uint256);

    function currentAmount() external view returns (uint256);

    function whitelist(uint256 _index) external view returns (address);

    function setWhitelistAddresses(address[] memory _whitelist) external;

    function receiverApprove() external;

    function ownerApprove() external;

    function isContractSigned() external view returns (bool);

    function deposit() external payable;

    function withdraw() external payable;

    function setPaymentDetails(
        address _reciever,
        uint256 _amount,
        uint256 _numberOfTransactions
    ) external;

    function createPaymentTo(address _reciever) external payable;

    function createPaymentToAll() external payable;
}
