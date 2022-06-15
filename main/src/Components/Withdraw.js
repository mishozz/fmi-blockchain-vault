import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'
import IWETH from '../abis/IWETH.json'
import Spinner from 'react-bootstrap/Spinner'

const ETH_ADDRESS = "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"


class Withdraw extends Component {

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

    withdraw = async () => {
        const web3 = window.web3
        this.setState({ loading: true })
        await this.props.vault.methods.withdraw()
            .send({from: this.props.account})
            .on('transactionHash', async (hash) => {
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
            <h1>Withdraw</h1>
            <h2 id="balance-h2">{this.getBalance()}</h2>
            <h2 id="vaultBalance-h2">{this.getVaultBalance()}</h2>
            <form onSubmit={(event) => {
                event.preventDefault();
                this.withdraw()
            }}>
                <InputGroup className="mb-3" >
                    <Button variant="outline-secondary" type="submit">Withdraw</Button>
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
export default Withdraw;
