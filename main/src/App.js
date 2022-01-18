import './App.css';
import { Component} from 'react';
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavBar from  './Components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Deposit from  './Components/Deposit'
import Vault from './abis/Vault.json'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      balance: '0',
      vault: {},
      vaultBalance: '0'
    }
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts() 
    this.setState({account: accounts[0]})
    const balance = await web3.eth.getBalance(this.state.account)
    this.setState({balance})

    // load vault contract
    const networkId =  await web3.eth.net.getId()
    const vaultData = Vault.networks[networkId]
    if(vaultData) {
      const vault = new web3.eth.Contract(Vault.abi, vaultData.address)
      this.setState({ vault })
      let vaultBalance = await web3.eth.getBalance(vaultData.address)
      this.setState({vaultBalance})
    } else {
      window.alert('Vault contract not deployed to detected network.')
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
    }
  }

  render() {
    return (
      <div >
        <MyNavBar/>
        <Router>
          <Routes>
            <Route exact path="/" />
            <Route exact path="/deposit" element={<Deposit  balance={this.state.balance} vaultBalance={this.state.vaultBalance} vault={this.state.vault} account={this.state.account}/>}/>
          </Routes>
      </Router>
      </div>
    );
  }
}
export default App;
