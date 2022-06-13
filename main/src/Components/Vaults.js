import {useState} from 'react'

const Vaults = ({setVaultList, vaultRegistry, account}) => {
    const [address, setAddress] = useState('');
    const web3 = window.web3

    const handleChange = event => {
      setAddress(event.target.value);
  
      console.log('value is:', event.target.value);
    };
  
    const handleClick = async (event) => {
      event.preventDefault();
        console.log(address)
        const assets = await vaultRegistry.methods.getAllAssets().call();
        console.log(assets)
       const vaults = await vaultRegistry.methods.getVaultsPerAsset(address).call();   
       console.log(vaults)
       setVaultList(vaults);
    };
  
    return (
      <div>
          <h2>Search for escrows</h2>
        <input
          type="text"
          id="address"
          name="address"
          onChange={handleChange}
          value={address}
          autoComplete="off"
        />
  
        <button onClick={handleClick}>Get Escrows</button>
      </div>
    );
}

export default Vaults
