import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'


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
        this.props.vault.methods.withdraw()
            .send({from: this.props.account})
            .on('transactionHash', async (hash) => {
                await new Promise(r => setTimeout(r, 200));
                this.setState({ loading: false })
                let ethBalance = await web3.eth.getBalance(this.props.account)
                let vaultBalance = await web3.eth.getBalance(this.props.vaultAddress)
                this.props.updateBalances(ethBalance, vaultBalance)
        })
      }

    render() {
        let content
        if(this.state.loading) {
        content = <p id="loader" className="text-center">Loading...</p>
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
