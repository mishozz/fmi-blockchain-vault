// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IVaultRegistry {
    struct RegistryConfiguration {
        address vaultFactory;
        address vaultETHFactory;
        address WETH;
    }

    event VaultDeployed(address vault, address asset);

    function WETH() external view returns (address);

    function getVaultsPerAsset(address asset)
        external
        view
        returns (address[] memory);

    function vaultFactory() external view returns (address);

    function vaultETHFactory() external view returns (address);

    function assets(uint256 index) external view returns (address);

    function getAllAssets() external view returns (address[] memory);

    function createVault(address asset) external;

    function createVaultETH() external;
}
