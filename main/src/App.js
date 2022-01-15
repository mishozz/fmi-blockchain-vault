import logo from './logo.svg';
import './App.css';
import { Component } from 'react';
import Web3 from 'web3'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: ''
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
  }

  async loadWeb3() {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
    }
  }

  render() {
    return (
      <div className="App">
   
      </div>
    );
  }
}
export default App;
