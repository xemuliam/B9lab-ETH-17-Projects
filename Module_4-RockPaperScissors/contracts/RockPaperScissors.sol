pragma solidity ^0.4.18;

import '../contractLibrary/contracts/contractModifiers/Pausable.sol';

contract RockPaperScissors is Pausable {

    enum Choices { Rock, Paper, Scissors }

    struct PlayerStruct {
        uint        balance;
        bool        isInGame;
    }

    struct GameStruct {
        address     playerOne;
        bytes32     playerOneChoice;
        address     playerTwo;
        bytes32     playerTwoChoice;
        uint        gameStake;
        uint        gameWinner;
    }

    uint public gameNumber;
    uint public correctDepositAmount;
    
    mapping(uint => GameStruct) private gameStructs;
    mapping(bytes32 => mapping(bytes32 => uint)) private playerChoices;
    mapping(address => PlayerStruct) private playerBalances;
    
    event LogDeposit(address sender, uint deposit, uint balance);
    event LogPlayer(address sender, uint gameNumber, uint playerNumber, Choices choice);
    event LogOutcome(uint gameNumber, uint gameResult);
    event LogWithdraw(address sender, uint amount);
    
    modifier gameNotInProgress() {
        require(!playerBalances[msg.sender].isInGame); 
        _;
    }
    
    function RockPaperScissors(uint setDepositAmount)
        public
    {
        require(setDepositAmount > 0);
        
        gameNumber = 1;
        correctDepositAmount = setDepositAmount;
        
        playerChoices[keccak256(Choices.Rock)][keccak256(Choices.Rock)] = 0;
        playerChoices[keccak256(Choices.Rock)][keccak256(Choices.Paper)] = 2;
        playerChoices[keccak256(Choices.Rock)][keccak256(Choices.Scissors)] = 1;
        playerChoices[keccak256(Choices.Paper)][keccak256(Choices.Paper)] = 0;
        playerChoices[keccak256(Choices.Paper)][keccak256(Choices.Rock)] = 1;
        playerChoices[keccak256(Choices.Paper)][keccak256(Choices.Scissors)] = 2;
        playerChoices[keccak256(Choices.Scissors)][keccak256(Choices.Scissors)] = 0;
        playerChoices[keccak256(Choices.Scissors)][keccak256(Choices.Rock)] = 2;
        playerChoices[keccak256(Choices.Scissors)][keccak256(Choices.Paper)] = 1;
    }
    
    function playerChoice(Choices choice)
        public
        payable
        isActive
        returns(bool success)
    {
        require(msg.value == correctDepositAmount);
        playerBalances[msg.sender].balance += msg.value;
        LogDeposit(msg.sender, msg.value, playerBalances[msg.sender].balance);
        gameStructs[gameNumber].gameStake = correctDepositAmount;
        
        if(gameStructs[gameNumber].playerOne == 0) {
            playerBalances[msg.sender].isInGame = true;
            gameStructs[gameNumber].playerOne = msg.sender;
            gameStructs[gameNumber].playerOneChoice = keccak256(choice);
            LogPlayer(msg.sender, gameNumber, 1, choice);
            
        } else if(gameStructs[gameNumber].playerTwo == 0) {
            require(msg.sender != gameStructs[gameNumber].playerOne);
            
            gameStructs[gameNumber].playerTwo = msg.sender;
            gameStructs[gameNumber].playerTwoChoice = keccak256(choice);
            LogPlayer(msg.sender, gameNumber, 2, choice);
            
            uint gameResult = playerChoices[gameStructs[gameNumber].playerOneChoice][gameStructs[gameNumber].playerTwoChoice];
            gameStructs[gameNumber].gameWinner = gameResult;
            LogOutcome(gameNumber, gameResult);
            
            if(gameResult == 1) {
                playerBalances[gameStructs[gameNumber].playerOne].balance += gameStructs[gameNumber].gameStake;
                playerBalances[gameStructs[gameNumber].playerTwo].balance -= gameStructs[gameNumber].gameStake;
            } else if(gameResult == 2) {
                playerBalances[gameStructs[gameNumber].playerOne].balance -= gameStructs[gameNumber].gameStake;
                playerBalances[gameStructs[gameNumber].playerTwo].balance += gameStructs[gameNumber].gameStake;
            }
            
            playerBalances[gameStructs[gameNumber].playerOne].isInGame = false;
            gameNumber++;
        }
        
        return true;
    }
    
    function withdrawWinnings() 
        public
        isActive
        gameNotInProgress
        returns(bool success)
    {
        uint payment = playerBalances[msg.sender].balance;
        require(payment > 0);

        playerBalances[msg.sender].balance = 0;
        LogWithdraw(msg.sender, payment);

        msg.sender.transfer(payment);

        return true;
    }
    
    function getBalance()
        public
        view
        returns(uint balance)
    {
        return playerBalances[msg.sender].balance;
    }
    
}
