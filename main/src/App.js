import './App.css';
import { Component} from 'react';
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavBar from  './Components/Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Deposit from  './Components/Deposit'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      balance: '0'
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
            <Route exact path="/deposit" element={<Deposit  balance={this.state.balance}/>}/>
          </Routes>
      </Router>
      </div>
    );
  }
}
export default App;
