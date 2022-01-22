import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl, Form} from 'react-bootstrap'


class Approve extends Component {

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


    recieverApprove = () => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.recieverApprove()
            .send({from: this.props.account})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
                this.setState({ loading: false })
        })
        this.setState({ loading: false })
    }

    ownerApprove = () => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.ownerApprove()
            .send({from: this.props.account})
            .on('transactionHash', async () => {
                await new Promise(r => setTimeout(r, 200));
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
            <h1>Contract signing</h1>
            <h2>Reciever approve</h2>
            <Button variant="outline-secondary" onClick={this.recieverApprove}>Approve</Button>
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
