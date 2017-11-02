pragma solidity ^0.4.18;

contract Splitter {
    
    address public owner;
    address public personAlice;
    address public personBob;
    address public personCarol;
    bool    public registrationComplete;
    bool    public contractActive;

    event LogRegistration(string name, address _address);
    event LogTransfer(address sender, address recipient, uint amount);

    function Splitter() 
        public 
    {
        owner = msg.sender;
        contractActive = true;
    }
 
    /*
        Alice, Bob and Carol need to register themselves using a unique address.
        Alice will be the first registered user, Bob will be second, and Carol
        will be last. No other users will be able to register.
    */
 
    function register()
        public
        returns(bool success)
    {
        require(contractActive == true);
        require(owner != msg.sender);
        if(personAlice == 0) {
            personAlice = msg.sender;
            LogRegistration('Alice', msg.sender);
            return true;
        }
        if(personBob == 0) {
            require(msg.sender != personAlice);
            personBob = msg.sender;
            LogRegistration('Bob', msg.sender);
            return true;
        }
        if(personCarol == 0) {
            require(msg.sender != personAlice);
            require(msg.sender != personBob);
            personCarol = msg.sender;
            LogRegistration('Carol', msg.sender);
            registrationComplete = true;
            return true;
        }
        
        return false;
    }
    
    function deposit()
        public
        payable
        returns(bool success)
    {
        require(contractActive == true);
        require(msg.sender == personAlice 
            || msg.sender == personBob
            || msg.sender == personCarol);
        require(msg.value != 0);
        
        if(msg.sender == personAlice) {
            var halfDeposit = msg.value / 2;
            LogTransfer(personAlice, personBob, halfDeposit);
            LogTransfer(personAlice, personCarol, halfDeposit);
            personBob.transfer(halfDeposit);
            personCarol.transfer(halfDeposit);
        }
        
        return true;
    }
    
    function getBalanceAlice()
        public
        view
        returns(uint balance)
    {
        require(contractActive == true);
        require(personAlice == msg.sender
            || owner == msg.sender);
        return personAlice.balance;
    }

    function getBalanceBob()
        public
        view
        returns(uint balance)
    {
        require(contractActive == true);
        require(personBob == msg.sender
            || owner == msg.sender);
        return personBob.balance;
    }
    
    function getBalanceCarol()
        public
        view
        returns(uint balance)
    {
        require(contractActive == true);
        require(personCarol == msg.sender
            || owner == msg.sender);
        return personCarol.balance;
    }
    
    function killContract()
        public
        returns(bool success)
    {
        require(contractActive == true);
        require(owner == msg.sender);
        contractActive = false;
        return true;
    }
    
}