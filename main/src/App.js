import './App.css';
import { Component} from 'react';
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavBar from  './Components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Deposit from  './Components/Deposit'
import Withdraw from  './Components/Withdraw'
import Vault from './abis/Vault.json'
import Whitelist from './Components/Whitelist';
import PaymentDetails from './Components/PaymentDetails'
import Payment from './Components/Payment'
import Approve from './Components/Approve'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      balance: '0',
      vault: {},
      vaultBalance: '0',
      vaultAddress: '',
      whitelist: []
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
    // load contract data
    if(vaultData) {
      const vault = new web3.eth.Contract(Vault.abi, vaultData.address)
      this.setState({vault})
      const vaultBalance = await web3.eth.getBalance(vaultData.address)
      this.setState({vaultBalance})
      this.setState({vaultAddress: vaultData.address})

      const whitelistLength = await vault.methods.whiteListLength.call().call()
      this.loadWhitelist(vault, whitelistLength)
    } else {
      window.alert('Vault contract not deployed to detected network.')
    }
  }

  async loadWhitelist(vault, length) {
    let whitelist = [];
    for(let i = 0; i < length; i++) {
      const address = await vault.methods.whitelist(i).call()
      whitelist.push(address)
    }
    this.setState({whitelist})
  }

  async loadWeb3() {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
    }
  }

  updateBalances = (ethBalance, vaultBalance) => {
    this.setState({
      balance: ethBalance,
      vaultBalance: vaultBalance
    })
  }

  updateWhitelist = (whitelist) => {
    this.setState({whitelist})
  }

  render() {
    return (
      <div >
        <MyNavBar/>
        <Router>
          <Routes>
            <Route exact path="/" />
            <Route exact path="/deposit" element={<Deposit vaultAddress={this.state.vaultAddress} updateBalances={this.updateBalances} balance={this.state.balance} vaultBalance={this.state.vaultBalance} vault={this.state.vault} account={this.state.account}/>}/>
            <Route exact path="/withdraw" element={<Withdraw vaultAddress={this.state.vaultAddress} updateBalances={this.updateBalances} balance={this.state.balance} vaultBalance={this.state.vaultBalance} vault={this.state.vault} account={this.state.account}/>}/>
            <Route exact path="/whitelist" element={<Whitelist updateWhitelist={this.updateWhitelist} whitelist={this.state.whitelist} vault={this.state.vault} account={this.state.account}/>}/>
            <Route exact path="/details" element={<PaymentDetails whitelist={this.state.whitelist} vaultAddress={this.state.vaultAddress} balance={this.state.balance} vaultBalance={this.state.vaultBalance} vault={this.state.vault} account={this.state.account}/>}/>
            <Route exact path="/payment" element={<Payment whitelist={this.state.whitelist} vaultAddress={this.state.vaultAddress} balance={this.state.balance} vaultBalance={this.state.vaultBalance} vault={this.state.vault} account={this.state.account}/>}/>
            <Route exact path="/approve" element={<Approve vaultAddress={this.state.vaultAddress} balance={this.state.balance} vault={this.state.vault} account={this.state.account}/>}/>
          </Routes>
      </Router>
      </div>
    );
  }
}
export default App;
