pragma solidity ^0.4.18;

import '../contractLibrary/contracts/contractModifiers/Pausable.sol';

contract RockPaperScissors is Pausable {

    enum Choices { None, Rock, Paper, Scissors }
    enum Outcomes { Draw, PlayerOneWinner, PlayerTwoWinner }

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
        Outcomes    gameWinner;
    }

    uint public gameNumber;
    uint public correctDepositAmount;
    
    mapping(uint => GameStruct) private gameStructs;
    mapping(bytes32 => mapping(bytes32 => Outcomes)) public playerOptions;
    mapping(address => PlayerStruct) private playerBalances;
    
    event LogDeposit(address sender, uint deposit);
    event LogPlayer(address sender, uint gameNumber, uint playerNumber, bytes32 hashChoice);
    event LogOutcome(uint gameNumber, Outcomes gameResult);
    event LogWithdraw(address sender, uint amount);
    
    modifier gameNotInProgress() {
        require(!playerBalances[msg.sender].isInGame); 
        _;
    }
    
    function RockPaperScissors(uint setDepositAmount)
        public
    {
        require(setDepositAmount > 0);
        
        gameNumber = 0;
        correctDepositAmount = setDepositAmount;
        
        playerOptions[keccak256(Choices.Rock)][keccak256(Choices.Rock)] = Outcomes.Draw;
        playerOptions[keccak256(Choices.Rock)][keccak256(Choices.Paper)] = Outcomes.PlayerTwoWinner;
        playerOptions[keccak256(Choices.Rock)][keccak256(Choices.Scissors)] = Outcomes.PlayerOneWinner;
        playerOptions[keccak256(Choices.Paper)][keccak256(Choices.Paper)] = Outcomes.Draw;
        playerOptions[keccak256(Choices.Paper)][keccak256(Choices.Rock)] = Outcomes.PlayerOneWinner;
        playerOptions[keccak256(Choices.Paper)][keccak256(Choices.Scissors)] = Outcomes.PlayerTwoWinner;
        playerOptions[keccak256(Choices.Scissors)][keccak256(Choices.Scissors)] = Outcomes.Draw;
        playerOptions[keccak256(Choices.Scissors)][keccak256(Choices.Rock)] = Outcomes.PlayerTwoWinner;
        playerOptions[keccak256(Choices.Scissors)][keccak256(Choices.Paper)] = Outcomes.PlayerOneWinner;
    }
    
    function playerChoice(Choices choice)
        public
        payable
        isActive
        returns(bool success)
    {
        require(msg.value == correctDepositAmount);
        playerBalances[msg.sender].balance += msg.value;
        LogDeposit(msg.sender, msg.value);

        GameStruct storage game = gameStructs[gameNumber];
        game.gameStake = correctDepositAmount;
        
        if(game.playerOne == 0) {
            playerBalances[msg.sender].isInGame = true;
            game.playerOne = msg.sender;
            game.playerOneChoice = keccak256(choice);
            LogPlayer(msg.sender, gameNumber, 1, game.playerOneChoice);
            
        } else if(game.playerTwo == 0) {
            require(msg.sender != game.playerOne);
            
            game.playerTwo = msg.sender;
            game.playerTwoChoice = keccak256(choice);
            LogPlayer(msg.sender, gameNumber, 2, game.playerTwoChoice);
            
            Outcomes gameResult = playerOptions[game.playerOneChoice][game.playerTwoChoice];
            game.gameWinner = gameResult;
            LogOutcome(gameNumber, gameResult);
            
            if(gameResult == Outcomes.PlayerOneWinner) {
                playerBalances[game.playerOne].balance += game.gameStake;
                playerBalances[game.playerTwo].balance -= game.gameStake;
            } else if(gameResult == Outcomes.PlayerTwoWinner) {
                playerBalances[game.playerOne].balance -= game.gameStake;
                playerBalances[game.playerTwo].balance += game.gameStake;
            }
            
            playerBalances[game.playerOne].isInGame = false;
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
    
    /** Getters */

    function getBalance()
        public
        view
        returns(uint balance)
    {
        return playerBalances[msg.sender].balance;
    }

    function getGameStruct(uint index) 
        public
        view
        returns(GameStruct gameStruct)
    {
        return gameStructs[index];
    }

    function getPlayerBalance(address player)
        public
        view
        returns(uint balance)
    {
        return playerBalances[player].balance;
    }

    function isPlayerInGame(address player)
        public
        view
        returns(bool isIndeed)
    {
        return playerBalances[player].isInGame;
    }
    
}