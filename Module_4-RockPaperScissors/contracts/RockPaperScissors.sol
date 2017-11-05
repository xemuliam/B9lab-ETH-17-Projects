pragma solidity ^0.4.13;

contract RockPaperScissors {
    
    address  public   owner;
    uint     public   rightEtherAmount;
    address  public   playerOne;
    address  public   playerTwo;
    
    uint8    private  playerOneChoice;
    uint8    private  playerTwoChoice;

    mapping (uint8 => mapping(uint8 => uint)) playerChoices;
    
    event LogWinner(address winner, uint winnings);
    
    function RockPaperScissors(uint _rightEtherAmount) 
        public 
    {
        owner = msg.sender;
        
        // set right ether amount
        rightEtherAmount = _rightEtherAmount;
        
        /*
            choices: rock = 1, paper = 2, scissors = 3
            results: draw = 0, playerOne win: 1, paperTwo win: 2
        */
        playerChoices[1][1] = 0;
        playerChoices[1][2] = 2;
        playerChoices[1][3] = 1;
        playerChoices[2][2] = 0;
        playerChoices[2][1] = 1;
        playerChoices[2][3] = 2;
        playerChoices[3][3] = 0;
        playerChoices[3][1] = 2;
        playerChoices[3][2] = 1;
    }
    
    modifier notRegisteredYet() {
        if((playerOne == msg.sender) || (playerTwo == msg.sender)) {
            revert();
        } else {
            _;
        }
    }
    
    function register()
        public
        payable
        notRegisteredYet()
        returns (bool success)
    {
        require(msg.value == rightEtherAmount);
        
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

    function playerChoice(uint8 choice)
        public
        returns(uint winner)
    {
        require(playerOne == msg.sender || playerTwo == msg.sender);
        require(choice >= 1 && choice <= 3);

        if(msg.sender == playerOne) {
            playerOneChoice = choice;
        }
        if(msg.sender == playerTwo) {
            playerTwoChoice = choice;
        }
        
        if((playerOneChoice > 0) && (playerTwoChoice > 0)) {
            uint result = playerChoices[playerOneChoice][playerTwoChoice];
            uint balance = this.balance;

            if(result == 0) {
                playerOne.transfer(balance / 2);
                playerTwo.transfer(balance / 2);
            } else if(result == 1) {
                playerOne.transfer(balance);
            } else if(result == 2) {
                playerTwo.transfer(balance);
            }
            
            if(result == 0) {
                LogWinner(playerOne, (balance / 2));
                LogWinner(playerTwo, (balance / 2));
            } else if(result == 1) {
                LogWinner(playerOne, balance);
            } else if(result == 2) {
                LogWinner(playerTwo, balance);
            }
            
            balance = 0;
            playerOne = 0x0;
            playerOneChoice = 0;
            playerTwo = 0x0;
            playerTwoChoice = 0;
            
            return result;
        }
        
        return 4; // no result yet
    }
    
    function getPlayerOneBalance()
        public
        constant
        returns(uint balance)
    {
        return playerOne.balance;
    }
    
    function getPlayerTwoBalance()
        public
        constant
        returns(uint balance)
    {
        return playerTwo.balance;
    }
    
    function getContractBalance()
        public
        constant
        returns(uint balance)
    {
        return this.balance;
    }
    
}