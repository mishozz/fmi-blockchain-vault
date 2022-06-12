const hre = require('hardhat');
const utils = require('../utils/constants');

const ethers = hre.ethers

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const vaultERC20 = await ethers.getContractFactory("VaultERC20");
    const vaultETH = await ethers.getContractFactory("VaultETH");
    const VaultFactory = await ethers.getContractFactory("VaultFactory");
    const VaultRegistry = await ethers.getContractFactory("VaultRegistry");

    const vaultFactory = await VaultFactory.deploy(vaultERC20.bytecode);
    const vaultFactoryETH = await VaultFactory.deploy(vaultETH.bytecode);
    const vaultRegistry = await VaultRegistry.deploy(vaultFactory.address, vaultFactoryETH.address, utils.ethAddress);

    console.log("factory address:", vaultFactory.address);
    console.log("factory ETH address:", vaultFactoryETH.address);
    console.log("registry address:", vaultRegistry.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });