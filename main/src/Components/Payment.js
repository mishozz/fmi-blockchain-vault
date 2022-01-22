import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl, Form} from 'react-bootstrap'


class Payment extends Component {

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

    getVaultBalance = () => {
        return "Vault Balance is " + window.web3.utils.fromWei(this.props.vaultBalance, 'Ether') + " ETH"
    }

    createPaymentTo = (reciever) => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.createPaymentTo(reciever)
            .send({from: this.props.account})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
                this.setState({ loading: false })
        })
        this.setState({ loading: false })
    }

    createPaymentToAll = () => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.createPaymentToAll()
            .send({from: this.props.account})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
                this.setState({ loading: false })
        })
        this.setState({ loading: false })
    }

    render() {
        const whitelist = this.props.whitelist.map((address) =>
            <option key={address}>{address}</option>
        )

        let content
        if(this.state.loading) {
        content = <p id="loader" className="text-center">Loading...</p>
        } else {
        content = <div>
            <h1>Create Payments</h1>
            <h2 id="vaultBalance-h2">{this.getVaultBalance()}</h2>
            <form onSubmit={(event) => {
                event.preventDefault();
                let reciever = this.reciever.value.toString()
                this.createPaymentTo(reciever)
            }}>
                <InputGroup className="mb-3" >
                    <Button variant="outline-secondary" type="submit">Create Payment</Button>
                    <Form.Select 
                        ref={(input) => this.reciever = input}
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
