// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/vault/IVault.sol";

abstract contract VaultCore is IVault, Ownable {
    bool public override contractSigned;
    bool public override hasOwnerSigned;
    uint256 public override currentAmount;
    address public override asset;
    address[] public override whitelist;

    mapping(address => receiver) public receivers;
    mapping(address => Payment) public paymentDetails;

    modifier onlyWhiteListed(address _wallet) {
        if (!receivers[_wallet].isWhiteListed) {
            revert Errors.V_NOT_WHITELISTED();
        }
        _;
    }

    modifier onlySigned(bool isSigned) {
        if (contractSigned != isSigned && isSigned) {
            revert Errors.V_NOT_SIGNED();
        } else if (contractSigned != isSigned) {
            revert Errors.V_ALREADY_SIGNED();
        }
        _;
    }

    constructor(address asset_) Ownable() {
        asset = asset_;
    }

    function setWhitelistAddresses(address[] memory _whitelist)
        public
        override
        onlyOwner
    {
        uint256 whiteListLength = _whitelist.length;
        for (uint256 i = 0; i < whiteListLength; ++i) {
            receivers[_whitelist[i]].isWhiteListed = true;
        }

        whitelist = _whitelist;

        emit WhitelistSet(_whitelist);
    }

    function receiverApprove() public override onlyWhiteListed(msg.sender) {
        receivers[msg.sender].hasSigned = true;
        contractSigned = isContractSigned();
    }

    function ownerApprove() public override onlyOwner {
        hasOwnerSigned = true;
        contractSigned = isContractSigned();
    }

    function isContractSigned() public view override returns (bool) {
        if (!hasOwnerSigned) {
            return false;
        }

        uint256 length = whitelist.length;
        for (uint256 i = 0; i < length; i++) {
            if (!receivers[whitelist[i]].hasSigned) {
                return false;
            }
        }

        return true;
    }

    function setPaymentDetails(
        address _receiver,
        uint256 _amount,
        uint256 _numberOfTransactions
    ) public override onlyWhiteListed(_receiver) {
        uint256 minAmount = _amount * _numberOfTransactions;
        if (currentAmount < minAmount) {
            revert Errors.V_NOT_ENOUGH_FUNDS_LOCKED();
        }

        paymentDetails[_receiver] = Payment({
            amount: _amount,
            numberOfTransactions: _numberOfTransactions
        });

        currentAmount -= minAmount;
    }
}
