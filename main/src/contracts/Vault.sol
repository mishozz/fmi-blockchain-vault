// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./interfaces/IVault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is IVault, Ownable {
    bool public override contractSigned;
    bool public override hasOwnerSigned;
    uint256 public override whiteListLength;
    uint256 public override currentAmount;
    address[] public override whitelist;

    mapping(address => Reciever) public recievers;
    mapping(address => Payment) public paymentDetails;

    modifier onlyWhiteListed(address _wallet) {
        require(recievers[_wallet].isWhiteListed, "Not whitelisted");
        _;
    }

    modifier onlySigned() {
        require(contractSigned, "Contract is not signed");
        _;
    }

    constructor() Ownable() {}

    function setWhitelistAddresses(address[] memory _whitelist)
        public
        onlyOwner
    {
        whiteListLength = _whitelist.length;
        for (uint256 i = 0; i < whiteListLength; ++i) {
            recievers[_whitelist[i]].isWhiteListed = true;
        }

        whitelist = _whitelist;

        emit WhitelistSet(_whitelist);
    }

    function recieverApprove() public onlyWhiteListed(msg.sender) {
        recievers[msg.sender].hasSigned = true;
        contractSigned = isContractSigned();
    }

    function ownerApprove() public onlyOwner {
        hasOwnerSigned = true;
        contractSigned = isContractSigned();
    }

    function isContractSigned() public view returns (bool) {
        if (!hasOwnerSigned) {
            return false;
        }

        uint256 length = whitelist.length;
        for (uint256 i = 0; i < length; i++) {
            if (!recievers[whitelist[i]].hasSigned) {
                return false;
            }
        }

        return true;
    }

    function deposit() public payable onlyOwner {
        currentAmount += msg.value;

        emit Recieved(msg.sender, msg.value);
    }

    function withdraw() public payable onlyOwner {
        require(!contractSigned, "Contract is already signed");

        uint256 balanceAmount = address(this).balance;
        payable(owner()).transfer(balanceAmount);

        emit Withdrawn(balanceAmount);
    }

    function setPaymentDetails(
        address _reciever,
        uint256 _amount,
        uint256 _numberOfTransactions
    ) public onlyWhiteListed(_reciever) {
        uint256 minAmount = _amount * _numberOfTransactions;
        require(
            currentAmount >= minAmount,
            "Not enough funds locked in the vault"
        );

        paymentDetails[_reciever] = Payment({
            amount: _amount,
            numberOfTransactions: _numberOfTransactions
        });

        currentAmount -= minAmount;
    }

    function createPaymentTo(address _reciever) public payable onlySigned {
        uint256 amountToBeSent = paymentDetails[_reciever].amount;

        require(
            amountToBeSent <= address(this).balance,
            "Not enough funds to execute the transaction"
        );

        require(
            paymentDetails[_reciever].numberOfTransactions > 0,
            "No transactions left"
        );

        payable(address(_reciever)).transfer(amountToBeSent);
        paymentDetails[_reciever].numberOfTransactions--;

        emit Sent(address(_reciever), amountToBeSent);
    }

    function createPaymentToAll() public payable onlySigned {
        uint256 length = whitelist.length;
        uint256 paymentAmount;

        for (uint256 i = 0; i < length; i++) {
            paymentAmount += paymentDetails[whitelist[i]].amount;
        }

        require(
            paymentAmount <= address(this).balance,
            "Not enough funds to execute the transaction"
        );

        for (uint256 i = 0; i < length; i++) {
            if (paymentDetails[whitelist[i]].numberOfTransactions > 0) {
                createPaymentTo(whitelist[i]);
            }
        }
    }
}
