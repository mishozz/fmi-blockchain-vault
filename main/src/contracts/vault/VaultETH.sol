// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/vault/IVaultETH.sol";
import "../interfaces/tokens/IWETH.sol";
import "./VaultCore.sol";

contract VaultETH is VaultCore, IVaultETH {
    constructor(address asset_) VaultCore(asset_) {}

    receive() external payable {}

    function deposit() public payable override onlyOwner {
        _preDeposit(msg.value);
        currentAmount += msg.value;

        emit Recieved(msg.sender, msg.value);
    }

    function withdraw(uint256 amount)
        public
        override
        onlySigned(false)
        onlyOwner
    {
        uint256 currentBalance = address(this).balance;
        if (amount > currentBalance) {
            amount = currentBalance;
        }

        _postWithdraw(amount, owner());

        emit Withdrawn(amount);
    }

    function createPaymentTo(address _receiver)
        public
        override
        onlySigned(true)
    {
        uint256 amountToBeSent = paymentDetails[_receiver].amount;

        if (amountToBeSent > IWETH(asset).balanceOf(address(this))) {
            revert Errors.V_NOT_ENOUGH_FUNDS_LOCKED();
        }

        if (paymentDetails[_receiver].numberOfTransactions == 0) {
            revert Errors.V_NO_TRANSACTIONS_LEFT();
        }

        paymentDetails[_receiver].numberOfTransactions--;
        _postWithdraw(amountToBeSent, _receiver);

        emit Sent(address(_receiver), amountToBeSent);
    }

    function createPaymentToAll() public override onlySigned(true) {
        uint256 length = whitelist.length;
        uint256 paymentAmount;

        for (uint256 i = 0; i < length; i++) {
            paymentAmount += paymentDetails[whitelist[i]].amount;
        }

        if (paymentAmount > IWETH(asset).balanceOf(address(this))) {
            revert Errors.V_NOT_ENOUGH_FUNDS_LOCKED();
        }

        for (uint256 i = 0; i < length; i++) {
            if (paymentDetails[whitelist[i]].numberOfTransactions > 0) {
                createPaymentTo(whitelist[i]);
            }
        }
    }

    function _preDeposit(uint256 amount) internal {
        if (amount != msg.value) {
            revert Errors.V_ETH_INSUFFICIENT_AMOUNT();
        }
        IWETH(asset).deposit{value: amount}();
    }

    function _postWithdraw(uint256 withdrawAmount, address to) internal {
        IWETH(asset).withdraw(withdrawAmount);
        (bool success, ) = to.call{value: withdrawAmount}(new bytes(0));
        if (!success) {
            revert Errors.V_SAFE_TRANSFER_NATIVE_FAILED();
        }
    }
}
