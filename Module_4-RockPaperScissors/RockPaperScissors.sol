pragma solidity ^0.4.18;

contract RockPaperScissors {
    
    address public owner;
    uint    public rightEtherAmount;
    address public playerOne;
    address public playerTwo;
    string  public playerOneChoice;
    string  public playerTwoChoice;

    mapping (string => mapping(string => int)) playerChoices;
    
    function RockPaperScissors(uint _rightEtherAmount) 
        public 
    {
        owner = msg.sender;
        
        // set right ether amount
        rightEtherAmount = _rightEtherAmount;
        
        // define options -- 0 for tie, 1 for player one win, 2 for player two win
        playerChoices["rock"]["rock"] = 0;
        playerChoices["rock"]["paper"] = 2;
        playerChoices["rock"]["scissors"] = 1;
        playerChoices["paper"]["paper"] = 0;
        playerChoices["paper"]["rock"] = 1;
        playerChoices["paper"]["scissors"] = 2;
        playerChoices["scissors"]["scissors"] = 0;
        playerChoices["scissors"]["rock"] = 2;
        playerChoices["scissors"]["paper"] = 1;
    }
    
    modifier alreadyRegistered() {
        if((playerOne == msg.sender) || (playerTwo == msg.sender)) {
            revert();
        } else {
            _;
        }
    }
    
    modifier confirmEtherAmount() {
        var depositInEther = msg.value / 1000000000000000000;
        if(depositInEther != rightEtherAmount) {
            revert();
        } else {
            _;
        }
    }

    function register()
        public
        payable
        alreadyRegistered()
        confirmEtherAmount()
        returns (bool success)
    {
        if(playerOne == 0) {
            playerOne = msg.sender;
            return true;
        }
        if((playerTwo == 0) && (playerOne != msg.sender)) {
            playerTwo = msg.sender;
            return true;
        }
        
        return false;
    }
    
    function playerChoice(string choice)
        public
        returns(int winner)
    {
        require(playerOne == msg.sender || playerTwo == msg.sender);
        bytes memory choiceTest = bytes(choice);
        require(choiceTest.length != 0);
        
        if(msg.sender == playerOne) {
            playerOneChoice = choice;
        }
        if(msg.sender == playerTwo) {
            playerTwoChoice = choice;
        }
        
        
        bytes memory playerOneChoiceTest = bytes(playerTwoChoice);
        bytes memory playerTwoChoiceTest = bytes(playerTwoChoice);
        if((playerTwoChoiceTest.length != 0) && (playerOneChoiceTest.length != 0)) {
            int result = playerChoices[playerOneChoice][playerTwoChoice];

            if(result == 0) {
                playerOne.transfer(this.balance / 2);
                playerTwo.transfer(this.balance / 2);
            } else if(result == 1) {
                playerOne.transfer(this.balance);
            } else if(result == 2) {
                playerTwo.transfer(this.balance);
            }

            //playerOne = 0;
            playerOneChoice = "";
            //playerTwo = 0;
            playerTwoChoice = "";
            return result;
            
        } else {
            return -1;
        }
    }
    
    function getPlayerOneBalance()
        public
        view
        returns(uint balance)
    {
        return playerOne.balance;
    }
    
    function getPlayerTwoBalance()
        public
        view
        returns(uint balance)
    {
        return playerTwo.balance;
    }
    
    function getContractBalance()
        public
        view
        returns(uint balance)
    {
        return this.balance;
    }
    
}