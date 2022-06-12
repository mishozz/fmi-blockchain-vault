import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Navbar, Container, Nav} from 'react-bootstrap'
import {Link} from 'react-router-dom'


class MyNavBar extends Component {
  render() {
    return (
      <div className="App">
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand to="/">FMI VAULT</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="deposit">Lock funds</Nav.Link>
              <Nav.Link as={Link} to="withdraw">Withdraw</Nav.Link>
              <Nav.Link as={Link} to="whitelist">Whitelist</Nav.Link>
              <Nav.Link as={Link} to="approve">Approve Contract</Nav.Link>
              <Nav.Link as={Link} to="details">Payment Details</Nav.Link>
              <Nav.Link as={Link} to="payment">Create Payment</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>
    );
  }
}
export default MyNavBar;
