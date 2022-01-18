import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {InputGroup, Button, FormControl} from 'react-bootstrap'
import Web3 from 'web3'


class Deposit extends Component {
    getBalance = () => {
        return "Balance is " + this.props.balance + " Wei"
    }



  render() {
    return (
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
    }}>
        <h1>Deposit</h1>
        <h2 id="balance-h2">{this.getBalance()}</h2>
        <InputGroup className="mb-3" >
            <Button variant="outline-secondary" id="deposit-btn">Deposit</Button>
        <FormControl
             aria-describedby="basic-addon1"
        />
        </InputGroup>
      </div>
    );
  }
}
export default Deposit;
