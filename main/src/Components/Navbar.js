import { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Navbar, Container, Nav} from 'react-bootstrap'


class MyNavBar extends Component {
  render() {
    return (
      <div className="App">
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand href="/">FMI VAULT</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link href="deposit">Lock funds</Nav.Link>
              <Nav.Link href="withdraw">Withdraw</Nav.Link>
              <Nav.Link href="createPayment">Create Payment</Nav.Link>
            </Nav>
          </Container>
        </Navbar>
      </div>
    );
  }
}
export default MyNavBar;
