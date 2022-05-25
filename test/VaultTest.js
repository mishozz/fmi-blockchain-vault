const chai = require('chai');
const hre = require('hardhat');

const { expect } = chai;
const ethers = hre.ethers

describe('Vault', () => {
    let vault, signers, owner, receiver, receiver2

    before(async () => {
        await hre.run("compile");

        signers = await ethers.getSigners()
        owner = signers[0]
        receiver = signers[1]
        receiver2 = signers[2]
    })

    beforeEach('setup contract for each test', async function () {
        const VaultContract = await ethers.getContractFactory("Vault");
        vault = await VaultContract.deploy();
    })

    it('has an owner', async function () {
        const vaultOwner = await vault.owner()
        expect(vaultOwner).to.equal(owner.address)
    })

    describe('deposit()', async () => {
        it('deposit success', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            const balance = await ethers.provider.getBalance(vault.address)
            const currentAmount = await vault.currentAmount()
            expect(balance).to.equal(ethers.utils.parseEther('0.1'))
            expect(currentAmount).to.equal(ethers.utils.parseEther('0.1'))
        })

        it('deposit fail: allowed only to owner', async () => {
            await expect(vault.connect(receiver).deposit({ value: ethers.utils.parseEther('0.1') })).to.be.reverted
        })
    })

    describe('withdraw()', async () => {
        it('withdraw success', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.withdraw()

            const vaultAddress = await vault.address
            const balance = await ethers.provider.getBalance(vaultAddress)

            expect(balance).to.equal(ethers.utils.parseEther('0'))
        })
        it('withdraw fail: allowed only to owner', async () => {
            await expect(vault.connect(receiver).withdraw()).to.be.reverted
        })
        it('withdraw fail: contract is signed', async () => {
            await vault.ownerApprove()
            await expect(vault.withdraw()).to.be.reverted
        })
    })

    describe('ownerApprove()', async () => {
        it('ownerAapprove success', async () => {
            await vault.ownerApprove()
            const hasSigned = await vault.hasOwnerSigned()
            expect(hasSigned).to.equal(true)
        })
    })

    describe('receiverApprove()', async () => {
        it('receiverApprove success', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()

            const whitelistedReceiver = await vault.receivers(receiver.address)
            expect(whitelistedReceiver.hasSigned).to.equal(true)
        })
    })

    describe('setWhitelistAddresses()', async () => {
        it('setWhitelistAddresses success', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            const whitelistedAddress = await vault.whitelist(0)
            const whitelistedReceiver = await vault.receivers(receiver.address)
            expect(whitelistedAddress).to.equal(receiver.address)
            expect(whitelistedReceiver.isWhiteListed).to.equal(true)
        })
    })

    describe('isContractSigned()', async () => {
        it('isContractSigned returns true: both parties signed', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()
            await vault.ownerApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(true)
        })

        it('isContractSigned returns false: only owner signed', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.ownerApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })

        it('isContractSigned returns false: only receiver signed', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })

        it('isContractSigned returns false: no one signed', async () => {
            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })
    })

    describe('setPaymentDetails()', async () => {
        it('setPaymentDetails success', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)

            let paymentDetails = await vault.paymentDetails(receiver.address)
            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(3)
            expect(paymentDetails.amount).to.equal(ethers.utils.parseEther('0.01'))
        })

        it('setPaymentDetails fail: not enough value locked', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])

            await expect(vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 11)).to.be.revertedWith('Not enough funds locked in the vault')
        })
    })

    describe('createPaymentTo()', async () => {
        it('createPaymentTo success', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentTo(receiver.address)

            const paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await ethers.provider.getBalance(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance).to.equal(ethers.utils.parseEther('0.09'))
        })

        it('createPaymentTo fail: contract not signed', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.015') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 1)

            await expect(vault.createPaymentTo(receiver.address)).to.be.revertedWith('Contract is not signed')
        })
    })

    describe('createPaymentToAll()', async () => {
        it('createPaymentToAll success', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address, receiver2.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)
            await vault.setPaymentDetails(receiver2.address, ethers.utils.parseEther('0.01'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.connect(receiver2).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentToAll()

            let paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await ethers.provider.getBalance(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance.toString()).to.equal(ethers.utils.parseEther('0.08'))
        })

        it('createPaymentToAll fail: contract not signed', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.015') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 1)

            await expect(vault.createPaymentToAll()).to.be.revertedWith('Contract is not signed')
        })
    })
})