const chai = require('chai');
const hre = require('hardhat');
const utils = require('../utils/constants');
const uniswapRouterABI = require("../main/src/abis/Uniswap.json");

const { expect } = chai;
const ethers = hre.ethers

describe('Vault', () => {
    let vault, signers, owner, receiver, receiver2, dai, uniswapRouter

    before(async () => {
        await hre.run("compile");

        signers = await ethers.getSigners()
        owner = signers[0]
        receiver = signers[1]
        receiver2 = signers[2]

        dai = await ethers.getContractAt("IERC20", utils.daiAddress)
        uniswapRouter = await ethers.getContractAt(
            uniswapRouterABI,
            utils.UniswapV2Router02Address
        );
    })

    beforeEach('setup contract for each test', async function () {
        const VaultContract = await ethers.getContractFactory("VaultERC20");
        vault = await VaultContract.deploy(utils.daiAddress);
    })

    const claimToken = async (
        signer,
        tokenAddress,
        tokenAmount = ethers.BigNumber.from("1")
    ) => {
        const deadline = (new Date(Date.now()).getTime() / 1000).toFixed(0) + 60 * 20;

        const uniTx = await uniswapRouter
            .connect(signer)
            .swapETHForExactTokens(
                tokenAmount,
                [utils.ethAddress, tokenAddress],
                signer.address,
                deadline,
                { value: "1000000000000000000000" }
            );
        await uniTx.wait();
    };

    it('Should have an owner', async function () {
        const vaultOwner = await vault.owner()
        expect(vaultOwner).to.equal(owner.address)
    })

    describe('deposit()', async () => {
        it('Should deposit successfully', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            const balance = await dai.balanceOf(vault.address)
            const currentAmount = await vault.currentAmount()
            expect(balance).to.equal(ethers.utils.parseEther('100'))
            expect(currentAmount).to.equal(ethers.utils.parseEther('100'))
        })

        it('Should revert on deposit when allowed only to owner', async () => {
            await claimToken(receiver, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.connect(receiver).approve(vault.address, ethers.utils.parseEther('100'));

            await expect(vault.connect(receiver).deposit(ethers.utils.parseEther('100'))).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })

    describe('withdraw()', async () => {
        it('Should withdraw successfully', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            const balanceBefore = await dai.balanceOf(owner.address)
            await vault.connect(owner).withdraw()
            const balanceAfter = await dai.balanceOf(owner.address)

            const balance = await dai.balanceOf(vault.address)
            expect(balance).to.equal(ethers.utils.parseEther('0'))
            const eval = balanceBefore.lt(balanceAfter)
            expect(eval).to.be.true
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
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 3)

            let paymentDetails = await vault.paymentDetails(receiver.address)
            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(3)
            expect(paymentDetails.amount).to.equal(ethers.utils.parseEther('10'))
        })

        it('Should revert on set payment details when not enough value locked', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            await vault.setWhitelistAddresses([receiver.address])

            await expect(vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 11)).to.be.revertedWith('V_NOT_ENOUGH_FUNDS_LOCKED')
        })
    })

    describe('createPaymentTo()', async () => {
        it('Should create payment to successfully', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentTo(receiver.address)

            const paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await dai.balanceOf(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance).to.equal(ethers.utils.parseEther('90'))
        })

        it('Should revert on create payment to when contract not signed', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('15'));
            await dai.approve(vault.address, ethers.utils.parseEther('15'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('15'))
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 1)

            await expect(vault.createPaymentTo(receiver.address)).to.be.revertedWith('V_NOT_SIGNED')
        })
    })

    describe('createPaymentToAll()', async () => {
        it('Should create payment to all successfully', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('100'));
            await dai.approve(vault.address, ethers.utils.parseEther('100'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('100'))
            await vault.setWhitelistAddresses([receiver.address, receiver2.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 3)
            await vault.setPaymentDetails(receiver2.address, ethers.utils.parseEther('10'), 3)
            await vault.connect(receiver).receiverApprove()
            await vault.connect(receiver2).receiverApprove()
            await vault.ownerApprove()
            await vault.createPaymentToAll()

            let paymentDetails = await vault.paymentDetails(receiver.address)
            const balance = await dai.balanceOf(vault.address)

            expect(paymentDetails.numberOfTransactions.toNumber()).to.equal(2)
            expect(balance.toString()).to.equal(ethers.utils.parseEther('80'))
        })

        it('Should revert on create payment to all when contract not signed', async () => {
            await claimToken(owner, utils.daiAddress, ethers.utils.parseEther('15'));
            await dai.approve(vault.address, ethers.utils.parseEther('15'));

            await vault.connect(owner).deposit(ethers.utils.parseEther('15'))
            await vault.setWhitelistAddresses([receiver.address])
            await vault.setPaymentDetails(receiver.address, ethers.utils.parseEther('10'), 1)

            await expect(vault.createPaymentToAll()).to.be.revertedWith('V_NOT_SIGNED')
        })
    })
})