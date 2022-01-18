import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'
import ReactDOM from 'react-dom'


class Deposit extends Component {

    constructor(props) {
        super(props)
        this.state = {
          loading: true
        }
    }

    async componentDidMount() {
        await new Promise(r => setTimeout(r, 100));
        this.setState({loading: false})
    }

    getBalance = () => {
        return "Your Balance is " + window.web3.utils.fromWei(this.props.balance, 'Ether') + " ETH"
    }


    getVaultBalance = () => {
        return "Vault Balance is " + window.web3.utils.fromWei(this.props.vaultBalance, 'Ether') + " ETH"
    }

    deposit = (etherAmount) => {
        this.setState({ loading: true })
        console.log(this.props.balance)
        console.log(this.props.account)
        console.log(etherAmount)
        this.props.vault.methods.deposit()
            .send({from: this.props.account, value: etherAmount})
            .on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
        this.setState({ loading: false })
      }

    render() {
        let content
        if(this.state.loading) {
        content = <p id="loader" className="text-center">Loading...</p>
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
                    <Button variant="outline-secondary" id="deposit-btn" type="submit">Deposit</Button>
                    <FormControl 
                        ref={(input) => this.input = input} 
                        aria-describedby="basic-addon1"
                    />
                </InputGroup>
            </form>
        </div>
        }
        return (
        <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)'}
        }>
            {content}
        </div>
    );
  }
}
export default Deposit;
