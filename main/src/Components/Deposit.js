import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'
import IWETH from '../abis/IWETH.json'
import Spinner from 'react-bootstrap/Spinner'

const ETH_ADDRESS = "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"

class Deposit extends Component {

    constructor(props) {
        super(props)
        this.state = {
          loading: true
        }
    }

    async componentDidMount() {
        await new Promise(r => setTimeout(r, 200));
        this.setState({loading: false})
    }

    getBalance = () => {
        return "Your Balance is " + window.web3.utils.fromWei(this.props.balance, 'Ether') + " ETH"
    }


    getVaultBalance = () => {
        return "Vault Balance is " + window.web3.utils.fromWei(this.props.vaultBalance, 'Ether') + " ETH"
    }

    deposit = async (etherAmount) => {
        const web3 = window.web3
        this.setState({ loading: true })
        console.log( "Account "+  this.props.account)
        console.log("ETher " +etherAmount)
        console.log(this.props.vault)
        const owner = await this.props.vault.methods.owner.call().call()
        console.log("Owner " + owner)
        await this.props.vault.methods.deposit()
            .send({from: this.props.account, value: etherAmount})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
        })
        this.setState({ loading: false })
        let ethBalance = await web3.eth.getBalance(this.props.account)
        const weth = new web3.eth.Contract(IWETH.abi, ETH_ADDRESS)
        const vaultBalance = await weth.methods.balanceOf(this.props.vaultAddress).call();
        this.props.updateBalances(ethBalance, vaultBalance)
      }

    render() {
        let content
        if(this.state.loading) {
        content = <div> <p id="loader" className="text-center">Loading...</p>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
        } else {
        content = <div>
            <h1>Deposit</h1>
            <h2 id="balance-h2">{this.getBalance()}</h2>
            <h2 id="vaultBalance-h2">{this.getVaultBalance()}</h2>
            <form onSubmit={(event) => {
                event.preventDefault();
                let etherAmount = this.input.value.toString()
                etherAmount = window.web3.utils.toWei(etherAmount, 'Ether')
                this.deposit(etherAmount)
            }}>
                <InputGroup className="mb-3" >
                    <Button variant="outline-secondary" type="submit">Deposit</Button>
                    <FormControl 
                        ref={(input) => this.input = input} 
                        aria-describedby="basic-addon1"
                    />
                </InputGroup>
            </form>
        </div>
        }
        return (
        <div className="central-wrapper">
            {content}
        </div>
    );
  }
}
export default Deposit;
