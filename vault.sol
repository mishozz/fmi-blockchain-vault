// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Vault {
    struct Payment {
        uint256 amount;
        uint256 numberOfTransactions;
    }

    struct Reciever {
        bool isWhiteListed;
        bool hasSigned;
    }

    struct Owner {
        address addr;
        bool hasSigned;
    }

    event Recieved(address sender, uint value);
    event WhitelistSet(address[] whitelist);
    event Sent(address addr, uint256 value);
    event Withdrawed(uint256 value);

    Owner owner;
    uint256 currentAmount = 0;
    mapping(address => Reciever) public recievers;
    address[] whitelist;
    mapping(address => Payment) public paymentDetails;

    modifier onlyOwner() {
        require(msg.sender == owner.addr);
        _;
    }

    modifier onlyReciever() {
        require(isWhiteListed(msg.sender));
        _;
    }

    constructor() payable {
        owner.addr = msg.sender;
    }

    function setWhitelistAddresses(address[] memory _whitelist) public onlyOwner {
       uint length = _whitelist.length;
       for(uint i = 0; i < length; i++) {
           recievers[_whitelist[i]].isWhiteListed = true;
       }
       whitelist = _whitelist;
       emit WhitelistSet(_whitelist);
    }

    function isWhiteListed(address _wallet) internal view returns (bool) {
        return recievers[_wallet].isWhiteListed;
    }

    function recieverApprove() public onlyReciever {
        recievers[msg.sender].hasSigned = true;
    }

    function ownerApprove() public onlyOwner {
        owner.hasSigned = true;
    }

    function isContractSigned() internal view returns (bool) {
        if(!owner.hasSigned) {
            return false;
        }
        bool areRecieversSigned = true;
        uint256 length = whitelist.length;
        for(uint256 i = 0; i < length; i++) {
            if(!recievers[whitelist[i]].hasSigned) {
                areRecieversSigned = false;
            }
        }
        return owner.hasSigned && areRecieversSigned;
    }

    function deposit() public payable onlyOwner{
        currentAmount += msg.value;
        emit Recieved(msg.sender, msg.value);
    }

    function withdraw() public payable onlyOwner {
        require(isContractSigned(), "Contract is not signed");
        uint256 balanceAmount = address(this).balance;
        payable(address(owner.addr)).transfer(balanceAmount);
        emit Withdrawed(balanceAmount);
    }


    function setPaymentDetails(address _reciever, uint256 _amount, uint256 _numberOfTransactions) public {
        require(isWhiteListed(_reciever), "Address is not whitelisted");
        require(currentAmount >= _amount*_numberOfTransactions, "Not enough funds locked in the vault");
        paymentDetails[_reciever] = Payment({
            amount: _amount,
            numberOfTransactions: _numberOfTransactions
            });
        currentAmount -= _amount*_numberOfTransactions;
    }

    function createPaymentTo(address _reciever) public payable {
        require(isContractSigned(), "Contract is not signed");
        uint256 amountToBeSent = paymentDetails[_reciever].amount;
        require(amountToBeSent <= address(this).balance, "Not enough funds to execute the transaction");
        payable(address(_reciever)).transfer(amountToBeSent);
        paymentDetails[_reciever].numberOfTransactions--;
        emit Sent(address(_reciever), amountToBeSent);
    }

    function createPaymentToAll() public payable {
        require(isContractSigned(), "Contract is not signed");
        uint256 length = whitelist.length;
        uint256 paymentAmount = 0;
        for(uint256 i = 0; i < length; i++) {
                paymentAmount += paymentDetails[whitelist[i]].amount;
        }
        require(paymentAmount <= address(this).balance, "Not enough funds to execute the transaction");
        for(uint256 i = 0; i < length; i++) {
            if(paymentDetails[whitelist[i]].numberOfTransactions > 0) {
                uint256 amountToBeSent = paymentDetails[whitelist[i]].amount;
                payable(address(whitelist[i])).transfer(amountToBeSent);
                paymentDetails[whitelist[i]].numberOfTransactions--;  
                emit Sent(address(whitelist[i]), amountToBeSent);
            }
        }
    }
}