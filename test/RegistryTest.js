const chai = require('chai');
const hre = require('hardhat');
const utils = require('../utils/constants');

const { expect } = chai;
const ethers = hre.ethers

describe('Vault', () => {
    let registry, signers, owner, receiver, receiver2, weth

    before(async () => {
        await hre.run("compile");

        signers = await ethers.getSigners()
        owner = signers[0]
        receiver = signers[1]
        receiver2 = signers[2]

        weth = await ethers.getContractAt("IWETH", utils.ethAddress)
    })

    beforeEach('setup contract for each test', async function () {
        const vaultERC20 = await ethers.getContractFactory("VaultERC20");
        const vaultETH = await ethers.getContractFactory("VaultETH");
        const VaultFactory = await ethers.getContractFactory("VaultFactory");
        const VaultRegistry = await ethers.getContractFactory("VaultRegistry");

        const vaultFactory = await VaultFactory.deploy(vaultERC20.bytecode);
        await vaultFactory.deployed();

        const vaultFactoryETH = await VaultFactory.deploy(vaultETH.bytecode);
        await vaultFactoryETH.deployed();

        registry = await VaultRegistry.deploy(vaultFactory.address, vaultFactoryETH.address, utils.ethAddress);
        await registry.deployed();
    })

    it('Should deploy ETH vault', async function () {
        await registry.createVaultETH();

        const vaults = await registry.getVaultsPerAsset(utils.ethAddress)
        expect(vaults.length).to.be.equal(1)
    })

    it('Should deploy ERC20 vault', async function () {
        await registry.createVault(utils.daiAddress);

        const vaults = await registry.getVaultsPerAsset(utils.daiAddress)
        expect(vaults.length).to.be.equal(1)
    })

    it('Should deploy ETH vault', async function () {
        await registry.createVaultETH();

        const vaults = await registry.getVaultsPerAsset(utils.ethAddress)

        const vault = await ethers.getContractAt("VaultETH", vaults[0])

        await vault.deposit({ value: ethers.utils.parseEther('0.1') })
    })
})