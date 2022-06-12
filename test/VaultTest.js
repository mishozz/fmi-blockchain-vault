const chai = require('chai');
const hre = require('hardhat');
const utils = require('../utils/constants');

const { expect } = chai;
const ethers = hre.ethers

describe('Vault', () => {
    let vault, signers, owner, receiver, receiver2, weth

    before(async () => {
        await hre.run("compile");

        signers = await ethers.getSigners()
        owner = signers[0]
        receiver = signers[1]
        receiver2 = signers[2]

        weth = await ethers.getContractAt("IWETH", utils.ethAddress)
    })

    beforeEach('setup contract for each test', async function () {
        const VaultContract = await ethers.getContractFactory("VaultETH");
        vault = await VaultContract.deploy(utils.ethAddress);
    })

    it('Should have an owner', async function () {
        const vaultOwner = await vault.owner()
        expect(vaultOwner).to.equal(owner.address)
    })

    describe('deposit()', async () => {
        it('Should deposit successfully', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            const balance = await weth.balanceOf(vault.address)
            const currentAmount = await vault.currentAmount()
            expect(balance).to.equal(ethers.utils.parseEther('0.1'))
            expect(currentAmount).to.equal(ethers.utils.parseEther('0.1'))
        })

        it('Should revert on deposit when allowed only to owner', async () => {
            await expect(vault.connect(receiver).deposit({ value: ethers.utils.parseEther('0.1') })).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('withdraw()', async () => {
        it('Should withdraw successfully', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.withdraw()

            const vaultAddress = await vault.address
            const balance = await ethers.provider.getBalance(vaultAddress)

            expect(balance).to.equal(ethers.utils.parseEther('0'))
        })
        it('Should revert on withdraw when allowed only to owner', async () => {
            await expect(vault.connect(receiver).withdraw()).to.be.revertedWith('Ownable: caller is not the owner')
        })
        it('Should revert on withdraw when contract is signed', async () => {
            await vault.ownerApprove()
            await expect(vault.withdraw()).to.be.revertedWith('V_ALREADY_SIGNED')
        })
    })

    describe('ownerApprove()', async () => {
        it('Should owner approve successfully', async () => {
            await vault.ownerApprove()
            const hasSigned = await vault.hasOwnerSigned()
            expect(hasSigned).to.equal(true)
        })
    })

    describe('receiverApprove()', async () => {
        it('Should receiver approve successfully', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()

            const whitelistedReceiver = await vault.receivers(receiver.address)
            expect(whitelistedReceiver.hasSigned).to.equal(true)
        })
    })

    describe('setWhitelistAddresses()', async () => {
        it('Should set whitelist addresses successfully', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            const whitelistedAddress = await vault.whitelist(0)
            const whitelistedReceiver = await vault.receivers(receiver.address)
            expect(whitelistedAddress).to.equal(receiver.address)
            expect(whitelistedReceiver.isWhiteListed).to.equal(true)
        })
    })

    describe('isContractSigned()', async () => {
        it('Should sign contract', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()
            await vault.ownerApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(true)
        })

        it('Should sign contract by owner only', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.ownerApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })

        it('Should sign contract by receiver only', async () => {
            await vault.setWhitelistAddresses([receiver.address])
            await vault.connect(receiver).receiverApprove()

            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })

        it('Should not sign contract', async () => {
            let isSigned = await vault.isContractSigned()
            expect(isSigned).to.equal(false)
        })
    })

    describe('setPaymentDetails()', async () => {
        it('Should set payment details successfully', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)

            let paymentDetails = await vault.paymentDetails(receiver.address)
            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(3)
            expect(paymentDetails.amount).to.equal(ethers.utils.parseEther('0.01'))
        })

        it('Should revert on set payment details when not enough value locked', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])

            await expect(vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 11)).to.be.revertedWith('V_NOT_ENOUGH_FUNDS_LOCKED')
        })
    })

    describe('createPaymentTo()', async () => {
        it('Should create payment to successfully', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentTo(receiver.address)

            const paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await weth.balanceOf(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance).to.equal(ethers.utils.parseEther('0.09'))
        })

        it('Should revert on create payment to when contract not signed', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.015') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 1)

            await expect(vault.createPaymentTo(receiver.address)).to.be.revertedWith('V_NOT_SIGNED')
        })
    })

    describe('createPaymentToAll()', async () => {
        it('Should create payment to all successfully', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.1') })
            await vault.setWhitelistAddresses([receiver.address, receiver2.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 3)
            await vault.setPaymentDetails(receiver2.address, ethers.utils.parseEther('0.01'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.connect(receiver2).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentToAll()

            let paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await weth.balanceOf(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance.toString()).to.equal(ethers.utils.parseEther('0.08'))
        })

        it('Should revert on create payment to all when contract not signed', async () => {
            await vault.connect(owner).deposit({ value: ethers.utils.parseEther('0.015') })
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('0.01'), 1)

            await expect(vault.createPaymentToAll()).to.be.revertedWith('V_NOT_SIGNED')
        })
    })
})