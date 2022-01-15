const Vault = artifacts.require("Vault");

require('chai')
    .use(require('chai-as-promised'))
    .should()
require("web3")
const assert = require('assert').strict;

contract('Vault', ([owner, reciever, reciever2]) => {
    let vault
    beforeEach('setup contract for each test', async function () {
        vault = await Vault.new()
    })

    it('has an owner', async function () {
        const vaultOwner = await vault.owner()
        const addr = vaultOwner.addr
        assert.equal(addr, owner)
    })

    describe('deposit()', async () => {
        it('deposit success', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            const vaultAddress = await vault.address
            const balance = await web3.eth.getBalance(vaultAddress)
            const currentAmount = await vault.currentAmount()
            assert.equal(balance, web3.utils.toWei('0.1','ether'))
            assert.equal(currentAmount.toString(), web3.utils.toWei('0.1','ether'))
        })

        it('deposit fail: allowed only to owner', async () => {
            let Error
            try{
                await vault.deposit({from: reciever, value: web3.utils.toWei('0.1','ether')})
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown');
            assert(Error.message.includes("Returned error: VM Exception while processing transaction"))
        })
    })

    describe('withdraw()', async () => {
        it('withdraw success', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            await vault.withdraw()
            const vaultAddress = await vault.address
            const balance = await web3.eth.getBalance(vaultAddress)
            assert.equal(balance, web3.utils.toWei('0','ether'))
        })
        it('withdraw fail: allowed only to owner', async () => {
            let Error
            try{
                await vault.withdraw({from: reciever})
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown');
        })
        it('withdraw fail: contract is signed', async () => {
            let Error
            try{
                vault.ownerApprove()
                await vault.withdraw()
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown');
        })
    })

    describe('ownerApprove()', async () => {
        it('ownerAapprove success', async () => {
            await vault.ownerApprove()
            const vaultOwner = await vault.owner()
            assert.equal(true, vaultOwner.hasSigned)
        })
    })

    describe('recieverApprove()', async () => {
        it('recieverApprove success', async () => {
            await vault.setWhitelistAddresses([reciever])
            await vault.recieverApprove({from: reciever})
            const whitelistedReciever = await vault.recievers(reciever)
            assert.equal(true, whitelistedReciever.hasSigned)
        })
    })

    describe('setWhitelistAddresses()', async () => {
        it('setWhitelistAddresses success', async () => {
            await vault.setWhitelistAddresses([reciever])
            const whitelistedAddress = await vault.whitelist(0)
            const whitelistedReciever = await vault.recievers(reciever)
            assert.equal(whitelistedAddress, reciever)
            assert.equal(whitelistedReciever.isWhiteListed, true)
        })
    })

    describe('isContractSigned()', async () => {
        it('isContractSigned returns true: both parties signed', async () => {
            await vault.setWhitelistAddresses([reciever])
            await vault.recieverApprove({from: reciever})
            await vault.ownerApprove()
            let isSigned = await vault.isContractSigned()
            assert.equal(isSigned, true)
        })

        it('isContractSigned returns false: only owner signed', async () => {
            await vault.setWhitelistAddresses([reciever])
            await vault.ownerApprove()
            let isSigned = await vault.isContractSigned()
            assert.equal(isSigned, false)
        })

        it('isContractSigned returns false: only reciever signed', async () => {
            await vault.setWhitelistAddresses([reciever])
            await vault.recieverApprove({from: reciever})
            let isSigned = await vault.isContractSigned()
            assert.equal(isSigned, false)
        })

        it('isContractSigned returns false: no one signed', async () => {
            let isSigned = await vault.isContractSigned()
            assert.equal(isSigned, false)
        })
    })

    describe('setPaymentDetails()', async () => {
        it('setPaymentDetails success', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            await vault.setWhitelistAddresses([reciever])
            await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 3)
            let paymentDetails = await vault.paymentDetails(reciever)
            assert.equal(paymentDetails.numberOfTransactions.toNumber(), 3)
            assert.equal(paymentDetails.amount.toString(), web3.utils.toWei('0.01','ether'))
        })

        it('setPaymentDetails fail: not enough value locked', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            await vault.setWhitelistAddresses([reciever])
            let Error
            try {
                await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 11)
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown')
            assert(Error.message.includes("Not enough funds locked in the vault"))
        })
    })

    describe('createPaymentTo()', async () => {
        it('createPaymentTo success', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            await vault.setWhitelistAddresses([reciever])
            await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 3)
            await vault.recieverApprove({from: reciever})
            await vault.ownerApprove()
            await vault.createPaymentTo(reciever)
            let paymentDetails = await vault.paymentDetails(reciever)
            const vaultAddress = await vault.address
            const balance = await web3.eth.getBalance(vaultAddress)
            assert.equal(paymentDetails.numberOfTransactions.toNumber(), 2)
            assert.equal(balance.toString(), web3.utils.toWei('0.09','ether'))
        })

        it('createPaymentTo fail: contract not signed', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.015','ether')})
            await vault.setWhitelistAddresses([reciever])
            await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 1)
            let Error
            try {
                await vault.createPaymentTo(reciever)
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown')
            assert(Error.message.includes('Contract is not signed'))
        })
    })

    describe('createPaymentToAll()', async () => {
        it('createPaymentToAll success', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.1','ether')})
            await vault.setWhitelistAddresses([reciever, reciever2])
            await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 3)
            await vault.setPaymentDetails(reciever2, web3.utils.toWei('0.01','ether'), 3)
            await vault.recieverApprove({from: reciever})
            await vault.recieverApprove({from: reciever2})
            await vault.ownerApprove()
            await vault.createPaymentToAll()
            let paymentDetails = await vault.paymentDetails(reciever)
            const vaultAddress = await vault.address
            const balance = await web3.eth.getBalance(vaultAddress)
            assert.equal(paymentDetails.numberOfTransactions.toNumber(), 2)
            assert.equal(balance.toString(), web3.utils.toWei('0.08','ether'))
        })

        it('createPaymentToAll fail: contract not signed', async () => {
            await vault.deposit({from: owner, value: web3.utils.toWei('0.015','ether')})
            await vault.setWhitelistAddresses([reciever])
            await vault.setPaymentDetails(reciever, web3.utils.toWei('0.01','ether'), 1)
            let Error
            try {
                await vault.createPaymentToAll()
            } catch (e) {
                Error = e
            }
            assert.notEqual(Error, undefined, 'Exception thrown')
            assert(Error.message.includes('Contract is not signed'))
        })
    })
})