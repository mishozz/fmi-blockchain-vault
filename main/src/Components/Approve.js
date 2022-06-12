import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { InputGroup, Button, FormControl, Form } from 'react-bootstrap'


class Approve extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            contractSigned: false
        }
    }

    async componentDidMount() {
        await new Promise(r => setTimeout(r, 200));
        this.setState({ loading: false })
        await this.isContractSigned()
    }

    receiverApprove = () => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.receiverApprove()
            .send({ from: this.props.account })
            .on('transactionHash', async () => {
                await this.isContractSigned()
                await new Promise(r => setTimeout(r, 200))
                this.setState({ loading: false })
            })
        this.setState({ loading: false })
    }

    ownerApprove = () => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.ownerApprove()
            .send({ from: this.props.account })
            .on('transactionHash', async () => {
                await this.isContractSigned()
                await new Promise(r => setTimeout(r, 200))
                this.setState({ loading: false })
            })
        this.setState({ loading: false })
    }

    isContractSigned = async () => {
        const web3 = window.web3
        const isContractSigned = await this.props.vault.methods.contractSigned.call().call()
        this.setState({ contractSigned: isContractSigned })
    }

    render() {
        let content
        if (this.state.loading) {
            content = <p id="loader" className="text-center">Loading...</p>
        } else {
            content = <div>
                <h1>Contract signed: {this.state.contractSigned.toString()} </h1>
                <br></br>
                <h2>receiver approve</h2>
                <Button variant="outline-secondary" onClick={this.receiverApprove}>Approve</Button>
                <h2>Owner approve</h2>
                <Button variant="outline-secondary" onClick={this.ownerApprove}>Approve</Button>
            </div>
        }
        return (
            <div className="central-wrapper">
                {content}
            </div>
        );
    }
}
export default Approve;
