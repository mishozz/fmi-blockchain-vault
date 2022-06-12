// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

library Errors {
    error V_ETH_INSUFFICIENT_AMOUNT();
    error V_SAFE_TRANSFER_NATIVE_FAILED();
    error V_ONLY_REGISTRY();
    error V_NOT_WHITELISTED();
    error V_NOT_SIGNED();
    error V_ALREADY_SIGNED();
    error V_NOT_ENOUGH_FUNDS_LOCKED();
    error V_NO_TRANSACTIONS_LEFT();
}
