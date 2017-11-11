pragma solidity ^0.4.18;

contract Splitter {
    
    bool    public contractActive;
    address public ownerAlice;
    address public personBob;
    address public personCarol;
    
    event LogRegistration(address Alice, address Bob, address Carol);
    event LogDeposit(uint depositFromAlice, uint shareToBob, uint shareToCarol);
    event LogKillSwitch(address ownerAlice);
    
    function Splitter() 
        public
    {
        ownerAlice = msg.sender;
        contractActive = true;
    }

    function registerBobAndCarol(address addressBob, address addressCarol) 
        public
        returns(bool success)
    {
        LogRegistration(msg.sender, addressBob, addressCarol);
        
        // should be three separate users
        require(msg.sender != addressBob);
        require(msg.sender != addressCarol);
        require(addressBob != addressCarol);
        
        ownerAlice = msg.sender;
        personBob = addressBob;
        personCarol = addressCarol;
        
        return true;       
    }
    
    function deposit()
        public
        payable
        returns(bool success)
    {
        require(contractActive);
        require(msg.sender == ownerAlice);
        require(msg.value != 0);
        require(msg.value % 2 == 0);
        
        uint halfDeposit = msg.value / 2;
        LogDeposit(msg.value, halfDeposit, halfDeposit);
        personBob.transfer(halfDeposit);
        personCarol.transfer(halfDeposit);

        return true;
    }
    
    function getBalanceAlice()
        public
        view
        returns(uint balance)
    {
        require(contractActive);
        require(msg.sender == ownerAlice);
        return ownerAlice.balance;
    }

    function getBalanceBob()
        public
        view
        returns(uint balance)
    {
        require(contractActive);
        require(personBob == msg.sender
            || ownerAlice == msg.sender);
        return personBob.balance;
    }
    
    function getBalanceCarol()
        public
        view
        returns(uint balance)
    {
        require(contractActive);
        require(personCarol == msg.sender
            || ownerAlice == msg.sender);
        return personCarol.balance;
    }
    
    function killContract()
        public
        returns(bool success)
    {
        require(ownerAlice == msg.sender);
        require(contractActive);
        contractActive = false;
        LogKillSwitch(msg.sender);
        ownerAlice.transfer(ownerAlice.balance);
        personBob.transfer(personBob.balance);
        personCarol.transfer(personCarol.balance);
        return true;
    }
    
}