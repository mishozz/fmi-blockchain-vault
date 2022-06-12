import {useState} from 'react'

const Vaults = ({loadVault}) => {
    const [address, setAddress] = useState('');

    const handleChange = event => {
      setAddress(event.target.value);
  
      console.log('value is:', event.target.value);
    };
  
    const handleClick = async (event) => {
      event.preventDefault();
      loadVault(address);
    };
  
    return (
      <div>
          <h2>Input valid escrow address</h2>
        <input
          type="text"
          id="address"
          name="address"
          onChange={handleChange}
          value={address}
          autoComplete="off"
        />
  
        <button onClick={handleClick}>Use Escrow</button>
      </div>
    );
}

export default Vaults
