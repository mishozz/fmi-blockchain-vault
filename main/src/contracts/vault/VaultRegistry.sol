// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../interfaces/vault/IVaultRegistry.sol";
import "../interfaces/vault/IVaultFactory.sol";
import "../interfaces/vault/IVault.sol";

contract VaultRegistry is IVaultRegistry {
    address public override vaultFactory;
    address public override vaultETHFactory;
    address public override WETH;
    address[] public override assets;

    // asset -> vaults[]
    mapping(address => address[]) public vaultsPerAsset;

    constructor(
        address _vaultFactory,
        address _vaultETHFactory,
        address _WETH
    ) {
        vaultFactory = _vaultFactory;
        vaultETHFactory = _vaultETHFactory;
        WETH = _WETH;
    }

    function getAllAssets() public view override returns (address[] memory) {
        return assets;
    }

    function getVaultsPerAsset(address asset)
        public
        view
        override
        returns (address[] memory)
    {
        return vaultsPerAsset[asset];
    }

    function createVault(address asset) external override {
        address vault = IVaultFactory(vaultFactory).createVault(asset);
        _initialiseVault(vault, asset);
    }

    function createVaultETH() external override {
        address vault = IVaultFactory(vaultETHFactory).createVault(WETH);
        _initialiseVault(vault, WETH);
    }

    function _initialiseVault(address vault, address asset) internal {
        if (vaultsPerAsset[asset].length == 0) {
            assets.push(asset);
        }
        vaultsPerAsset[asset].push(vault);

        Ownable(vault).transferOwnership(msg.sender);

        emit VaultDeployed(vault, asset);
    }
}
