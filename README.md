# FMI Vault contract

## Local developement

**Requirments**

**npm** (Node package manager) must be installed

- Install truffle

`npm install -g truffle` 

- Install ganache cli or install Ganache GUI - https://trufflesuite.com/ganache/

`npm install -g ganache-cli`

- Install react

`npm i react`

`npm install react-bootstrap bootstrap@5.1.3`

`react-router-dom`

- Install Metamask in your browser

**How to run**
- Connect to Ganache
- In the project folder deploy the smart contract: 

`truffle init`

`truffle migrate`

- Connect your metamask to the local Ganache blockchain.

- Connect an Address from your Ganache to Metamask

- In the `main` folder run

`cd main`

`npm start`

## Run Tests

`truffle test`

## Overview

Escrow Service is smart contract which stores and automates payments without the need of third parties. Operating on the Etherium network gives the vault security and transparency. The contract can be used non formally by two parties when they don't trust each other.

## Why using Blockchain

Although, this type of contract can be implemented using other technologies such an SQL database and others, the blockchain gives decentralization which leads to trust. In this type of contracts trust is the most important thing. Firstly everything must be secured, when using blockchain there is no central point of attack and secondly there is no middle man who must be trusted. Everything is handled by code. Also every transaction can be tracked no matter when it was executed.

The Etherium blockain for now is a perfect choice because it is the most decentralized network which makes it the most secured and without any downtime. However, there are some disadvantages such as speed and cost of transactions. That is why in the future we plan for our FMI Vault to be cross-chain compatible so it can be run on all of the layer two solutions and other layer one blockchains.

## Different payment workflows

FMI Vault is giving it users the possibility to choose from different payment workflows.
- [Immutable payments](#immutable-payment-schedule)

### Immutable payments

The idea here is simple: Create an immutable vault with pre-locked funds in it. Although this workflow has limited real world usecases it is in the core of some deals between two parties.

**The workflow has 3 steps:**
- 1. Owner locks funds in the vault and whitelists the recieving wallets adresses.
- 2. The recieving wallets must authorize the payment.
- 3. Owner finally signs the contract

**Workflow in details**

The owner of the funds locks ether or stable coins in order to avoid the volatility of the price in some of the other crypto currencies. Before the contract is signed by both sender and reciever, the sender can withdraw his funds at any time. Both parties can set the payment schedule. The recieving adresses must sign the contract. At this step the owner of the funds can withdraw and cancel the contract or sign it. When signing it by both owner and recieving wallets the contract is in play and can not be reversed.

**Payment Features**

Before signing the smart contract by both parties **numberOfTransactions** and **amount**. Each recieving wallet address can have unique number of transactions and value per transaction. The maximum number of trasactions to each wallet are equal to the number of funds locked in the vault devided by the number or transaction.

For example 1000 USDT are locked. "Wallet A" can recieve max 1000 USDT at once or every Monday 100 USDT. That means the maximum number of transactions to this wallet are **1000 / 100 = 10**.

Another scenario is 1000 USDT locked, "Wallet A" sets 100 USDT for 5 weeks to be sent it. That leaves 500 USDT for the other whitelisted wallets. 

After the contract is signed. There are two possibilities to make payments.

- **createPaymentTo** sends the preconfigured amount of funds to the provided address. The address must have been whitelisted.
- **createPaymentToAll** sends the precofigured amount of funds to all whitelisted addresses.

For both payment strategies the code checks that enough funds are locked in order to execute the transaction. Also if the number of transactions left is less than 1 no transaction is being executed.

**Security Features**

Since the contract is immutable after it's in play it must be signed by **All* whitelisted wallets and the owner of the funds as well. Multisigature can be used to sign the contract from the owner address.

- Only the owner of the contract can lock value and only the owner can withdraw the locked value to him self.
- Only whitelisted addresses can recieve funds.
- Only the owner and the whitelisted addresses can sign the contract

**Cons**

Once signed the contract can't be reverted. So before signing it everything should be clear between the owner and recievers.
Before signing both parties should carefully calculate exactly how many funds they should lock in order to execute all of their transactions successfully.
Another con is that someone has to execute the create payment methods. This leads to some centralization, but solidity does not support scheduling of transaction.
