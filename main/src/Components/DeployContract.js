import {useState} from 'react'
import ERC20 from '../abis/ERC20.json'

const ETH_ADDRESS = "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"

const DeployContract = ({addAsset, vaultRegistry, account}) => {
    const [address, setAddress] = useState('');
    const web3 = window.web3

    const handleChange = event => {
      setAddress(event.target.value);
  
      console.log('value is:', event.target.value);
    };
  
    const handleClick = async (event) => {
      event.preventDefault();
      const token = new web3.eth.Contract(ERC20, address)
      const symbol = await token.methods.symbol().call()
      console.log(symbol)
 
      addAsset({address: address,symbol: symbol})

      await vaultRegistry.methods.createVault(address).send({from: account})
      .on('transactionHash', async () => {
          console.log("success")
      });   


      console.log('handleClick', address);
    };

    const handleClickEth = async (event) => {
      event.preventDefault();
      console.log("Account " + account)
 
      addAsset({address: ETH_ADDRESS,symbol: "ETH"})

      await vaultRegistry.methods.createVaultETH()
            .send({from: account})
          .on('transactionHash', async () => {
          console.log("success")
      });   

      console.log('handleClick', address);
    };
  
    return (
      <div>
          <h2>Input the address of ERC20 TOKEN in order to create an escrow with it</h2>
        <input
          type="text"
          id="address"
          name="address"
          onChange={handleChange}
          value={address}
          autoComplete="off"
        />
  
        <button onClick={handleClick}>Deploy ERC20 </button>
        <br/>
        <br/>
        <button onClick={handleClickEth}>Deploy ETH </button>
      </div>
    );
}

export default DeployContract
