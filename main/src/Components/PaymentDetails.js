import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, Button, FormControl, Form } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner'


class PaymentDetails extends Component {

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

    getBalance = () => {
        return "Your Balance is " + window.web3.utils.fromWei(this.props.balance, 'Ether') + " ETH"
    }


    getVaultBalance = () => {
        return "Vault Balance is " + window.web3.utils.fromWei(this.props.vaultBalance, 'Ether') + " ETH"
    }

    setPayment = async (reciever, amount, numberOfTransactions) => {
        const web3 = window.web3
        this.setState({ loading: true })
        await this.props.vault.methods.setPaymentDetails(reciever, amount, numberOfTransactions)
            .send({ from: this.props.account })
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
            })
        this.setState({ loading: false })
    }

    render() {
        const whitelist = this.props.whitelist.map((address) =>
            <option key={address}>{address}</option>
        )

        let content
        if (this.state.loading) {
            content = <div> <p id="loader" className="text-center">Loading...</p>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        } else {
            content = <div>
                <h1>Set Payment Details</h1>
                <h2 id="vaultBalance-h2">{this.getVaultBalance()}</h2>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    let numberOfTransactions = this.numberOfTransactions.value.toString()
                    numberOfTransactions = parseInt(numberOfTransactions)
                    let amount = this.amount.value.toString()
                    amount = window.web3.utils.toWei(amount, 'Ether')
                    let receiver = this.receiver.value.toString()
                    this.setPayment(receiver, amount, numberOfTransactions)
                }}>
                    <InputGroup className="mb-3" >
                        <Button variant="outline-secondary" type="submit">Set</Button>
                        <Form.Select
                            ref={(input) => this.receiver = input}
                            size="lg">
                            {whitelist}
                        </Form.Select>
                        <FormControl
                            ref={(input) => this.amount = input}
                            aria-describedby="basic-addon1"
                            placeholder="amount per transaction"
                        />
                        <FormControl
                            ref={(input) => this.numberOfTransactions = input}
                            aria-describedby="basic-addon1"
                            placeholder="number of transactions"
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
export default PaymentDetails;
