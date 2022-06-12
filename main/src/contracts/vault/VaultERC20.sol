// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/vault/IVaultERC20.sol";
import "./VaultCore.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultERC20 is VaultCore, IVaultERC20 {
    constructor(address asset_) VaultCore(asset_) {}

    function deposit(uint256 amount) public override onlyOwner {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        currentAmount += amount;

        emit Recieved(msg.sender, amount);
    }

    function withdraw() public override onlySigned(false) onlyOwner {
        uint256 currentBalance = IERC20(asset).balanceOf(address(this));

        IERC20(asset).transfer(owner(), currentBalance);

        emit Withdrawn(currentBalance);
    }

    function createPaymentTo(address _receiver)
        public
        override
        onlySigned(true)
    {
        uint256 amountToBeSent = paymentDetails[_receiver].amount;
        if (amountToBeSent > IERC20(asset).balanceOf(address(this))) {
            revert Errors.V_NOT_ENOUGH_FUNDS_LOCKED();
        }

        if (paymentDetails[_receiver].numberOfTransactions == 0) {
            revert Errors.V_NO_TRANSACTIONS_LEFT();
        }

        paymentDetails[_receiver].numberOfTransactions--;
        IERC20(asset).transfer(_receiver, amountToBeSent);

        emit Sent(address(_receiver), amountToBeSent);
    }

    function createPaymentToAll() public override onlySigned(true) {
        uint256 length = whitelist.length;
        uint256 paymentAmount;

        for (uint256 i = 0; i < length; i++) {
            paymentAmount += paymentDetails[whitelist[i]].amount;
        }

        if (paymentAmount > IERC20(asset).balanceOf(address(this))) {
            revert Errors.V_NOT_ENOUGH_FUNDS_LOCKED();
        }

        for (uint256 i = 0; i < length; i++) {
            if (paymentDetails[whitelist[i]].numberOfTransactions > 0) {
                createPaymentTo(whitelist[i]);
            }
        }
    }
}
