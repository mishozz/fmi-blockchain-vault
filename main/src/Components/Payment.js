import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl, Form} from 'react-bootstrap'
import IWETH from '../abis/IWETH.json'
import Spinner from 'react-bootstrap/Spinner'

const ETH_ADDRESS = "0x0a180A76e4466bF68A7F86fB029BEd3cCcFaAac5"


class Payment extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true
        }
    }

    async componentDidMount() {
        await new Promise(r => setTimeout(r, 200));
        this.setState({ loading: false })
    }

    getVaultBalance = () => {
        return "Vault Balance is " + window.web3.utils.fromWei(this.props.vaultBalance, 'Ether') + " ETH"
    }

    createPaymentTo = async (reciever) => {
        const web3 = window.web3
        this.setState({ loading: true })
        await this.props.vault.methods.createPaymentTo(reciever)
            .send({from: this.props.account})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
        })
        this.setState({ loading: false })
        let ethBalance = await web3.eth.getBalance(this.props.account)
        const weth = new web3.eth.Contract(IWETH.abi, ETH_ADDRESS)
        const vaultBalance = await weth.methods.balanceOf(this.props.vaultAddress).call();
        this.props.updateBalances(ethBalance, vaultBalance)
    }

    createPaymentToAll = async () => {
        const web3 = window.web3
        this.setState({ loading: true })
        await this.props.vault.methods.createPaymentToAll()
            .send({from: this.props.account})
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
        const whitelist = this.props.whitelist.map((address) =>
            <option key={address}>{address}</option>
        )

        let content
        if(this.state.loading) {
        content = <div> <p id="loader" className="text-center">Loading...</p>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
        } else {
            content = <div>
                <h1>Create Payments</h1>
                <h2 id="vaultBalance-h2">{this.getVaultBalance()}</h2>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    let receiver = this.receiver.value.toString()
                    this.createPaymentTo(receiver)
                }}>
                    <InputGroup className="mb-3" >
                        <Button variant="outline-secondary" type="submit">Create Payment</Button>
                        <Form.Select
                            ref={(input) => this.receiver = input}
                            size="lg">
                            {whitelist}
                        </Form.Select>
                    </InputGroup>
                </form>
                <h2>Create Payment to All</h2>
                <Button variant="outline-secondary" onClick={this.createPaymentToAll} >Create Payment</Button>
            </div>
        }
        return (
            <div className="central-wrapper">
                {content}
            </div>
        );
    }
}
export default Payment;
