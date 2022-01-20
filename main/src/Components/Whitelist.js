import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'


class Whitelist extends Component {

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

    setWhitelistAddresses = async (whitelist) => {
        const web3 = window.web3
        this.setState({ loading: true })
        this.props.vault.methods.setWhitelistAddresses(whitelist)
            .send({from: this.props.account})
            .on('transactionHash', async (hash) => {
                await new Promise(r => setTimeout(r, 200));
                this.setState({loading: false })
                this.props.updateWhitelist(whitelist)
        })
      }

    render() {
        const whitelist = this.props.whitelist.map((address) =>
            <li key={address}>{address}</li>
        )

        let content
        if(this.state.loading) {
        content = <p id="loader" className="text-center">Loading...</p>
        } else {
        content = <div>
            <h1>Set reciever's addresses</h1>
            <h2>Whitelist addresses</h2>
            <ul>{whitelist}</ul>
            <form onSubmit={(event) => {
                event.preventDefault();
                let whitelist = this.input.value.toString()
                whitelist = whitelist.replaceAll(" ", "").split(',')
                this.setWhitelistAddresses(whitelist)
            }}>
                <InputGroup className="mb-3" >
                    <Button variant="outline-secondary" type="submit">Whitelist</Button>
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
export default Whitelist;
