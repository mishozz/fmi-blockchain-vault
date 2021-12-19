# XXX Vault contract

## Overview

XXX can be viewed as smart legal contract which stores and automates payments without the need of third parties. Operating on the Etherium network gives the vault security and transparency. The contract can be used non formally by two parties when they don't trust each other, but also as mentioned above it can be used as a legal settlement.

## Why using Blockchain

Although, this type of contract can be implemented using other technologies such an SQL database and others, the blockchain gives decentralization which leads to trust. In this type of contracts trust is the most important thing. Firstly everything must be secured, when using blockchain there is no central point of attack and secondly there is no middle man who must be trusted. Everything is handled by code. Also every transaction can be tracked no matter when it was executed. This will slow down the corruption. Actaully legal settements such as payments for government procurements can be tracked and therfore it will be hard to steal money from the payments. 

The Etherium blockain for now is a perfect choice because it is the most decentralized network which makes it the most secured and without any downtime. However, there are some disadvantages such as speed and cost of transactions. That is why in the future we plan for our XXX Vault to be cross-chain compatible so it can be run on all of the layer two solutions and other layer one blockchains.

## Different payment workflows

XXX Vault is giving it users the possibility to choose from different payment workflows.
- [Immutable payment schedule](#immutable-payment-schedule)
- [Smart legal payment schedule](#smart-legal-payment-schedule)

### Immutable payment schedule

The idea here is simple: Create an immutable vault which automates payments on preconfigured schedule. Although this workflow has limited real world usecases it is in the core of some deals between two parties. For example you buy a second hand car which looks perfects but after two weeks the engine is broken, you can't just take your money back because the deal is already settleted.

**The workflow has 3 steps:**
- 1. Owner locks funds in the vault and whitelists the recieving wallets adresses.
- 2. The recieving wallets must authorize the payment.
- 3. Owner finally signs the contract

**Workflow in details**

The owner of the funds locks stable coins in order to avoid the volatility of the price in some of the other crypto currencies. Before the contract is signed by both sender and reciever, the sender can withdraw his funds at any time. Both parties can set the payment schedule. The recieving adresses must sign the contract. At this step the owner of the funds can withdraw and cancel the contract or sign it. When signing it by both owner and recieving wallets the contract is in play and can not be reversed.

**Payment Features**

Before signing the smart contract by both parties **transactionSchedule** and **valuePerTransaction**. Each recieving wallet address can have unique transaction schedule and value per transaction. The maximum number of trasactions to each wallet are equal to the number of funds locked in the vault devided by the number or transaction.

For example 1000 USDT are locked. "Wallet A" can recieve max 1000 USDT at once or every Monday 100 USDT. That means the maximum number of transactions to this wallet are **1000 / 100 = 10**.

Another scenario is 1000 USDT locked, "Wallet A" sets 100 USDT for 5 weeks to be sent it. That leaves 500 USDT for the other whitelisted wallets. 

**Security Features**

Since the contract is immutable after it's in play it must be signed by **All* whitelisted wallets and the owner of the funds as well. Multisigature can be used to sign the contract from the owner address.


### Smart legal payment schedule

Smart contract won't be useful for legal perposes if they can't be canceled if some of the real world contract requirments are not fulfilled. For example government procurements for building a highway. If the highway is not fully build by some date the payment can not continiue

**The workflow has 4 steps:**
- 1. Owner locks funds in the vault and whitelists the recieving wallets adresses.
- 2. The recieving wallets must authorize the payment.
- 3. The recieving wallets must authorize 5 addresses for multisig which later can be used to cancel the contract
- 3. Owner finally signs the contract

**Workflow in details**

The only difference to the Immutable payment schedule is that the contract can be canceled multisig is signed. Another option is the contract to work with Oracles like Chainlink where real world data can be provided to the contract in order to cancel it. 

**Security Features**

Five addresses must be authorized for the multisig. In order to cancel it 5 of 5 multisig must be signed. The other possibility to cancel the contract is an Oracle which provides real world data to the contract. Obviously both methods have security gaps. The five addresses from the multisig must be trusted and also the oracles must be trusted that it won't provide false data to the contract.
