import './App.css';
import { Component} from 'react';
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavBar from  './Components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Deposit from  './Components/Deposit'
import Withdraw from  './Components/Withdraw'
import VaultETH from './abis/VaultETH.json'
import Whitelist from './Components/Whitelist';
import PaymentDetails from './Components/PaymentDetails'
import Payment from './Components/Payment'
import Approve from './Components/Approve'
import DeployContract from './Components/DeployContract'
import VaultList from './Components/VaultList'
import Vaults from './Components/Vaults'
import LoadVault from './Components/LoadVault'
import Registry from './abis/Registry.json'
import IWETH from './abis/IWETH.json'

const REGISTRY_ADDRESS = "0x2Cf410f2CBD7305490c90BF334260664b50038B4"
const ETH_ADDRESS = "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assets: [],
      currentAssets: [],
      vaultList: [],
      account: '',
      balance: '0',
      vault: {},
      vaultBalance: '0',
      vaultAddress: '',
      whitelist: [],
      vaultRegistry: {}
    }
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadVaultRegistry()
  }

  async loadVaultRegistry() {
    const web3 = window.web3
    const vaultRegistry = new web3.eth.Contract(Registry.abi, REGISTRY_ADDRESS)
    this.setState({vaultRegistry: vaultRegistry});
    const accounts = await web3.eth.getAccounts() 
    this.setState({account: accounts[0]})
  }

  loadVault = async (address) => {
    const web3 = window.web3
    const balance = await web3.eth.getBalance(this.state.account)
    this.setState({balance})

    // load contract data
      const vault = new web3.eth.Contract(VaultETH.abi, address)
      this.setState({vault: vault})
      const weth = new web3.eth.Contract(IWETH.abi, ETH_ADDRESS)

      const vaultBalance = await weth.methods.balanceOf(address).call()
      this.setState({vaultBalance: vaultBalance})
      this.setState({vaultAddress: address})
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

  addAsset = (asset) => {
    this.setState(prev => ({currentAssets: [...prev.currentAssets, asset]}))
  }

  setVaultList = (vautList) => {
    this.setState({vaultList: vautList})
  }

  setVaultAddress = (vaultAddress) => {
    this.setState({vaultAddress: vaultAddress})
  }

  

  render() {
    return (
      <div >
        {this.state.vaultAddress != '' ?
          <>
                <Router>
                <MyNavBar/>
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
          </> :
          <div>
              <DeployContract addAsset={this.addAsset} account={this.state.account} setVaultList={this.setVaultList} vaultRegistry={this.state.vaultRegistry}/>
              <br></br>

              <h2>Currently added assets</h2>
              <ul>
                {this.state.currentAssets.map(asset => {
                  return <li key={asset.address}> {asset.address} || {asset.symbol}</li>
                })}
              </ul>
              <br></br>
              <Vaults vaultRegistry={this.state.vaultRegistry} account={this.state.account} setVaultList={this.setVaultList}/>
              <br></br>
              <h2>Escrow addresses</h2>
              <br></br>
              <VaultList vaultList={this.state.vaultList}/>
              <br></br>
              <LoadVault loadVault={this.loadVault}/>
          </div> 
        }
      </div>
    );
  }
}
export default App;
