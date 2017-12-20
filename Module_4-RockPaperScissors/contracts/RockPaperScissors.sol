pragma solidity ^0.4.18;

import '../contractLibrary/contracts/contractModifiers/Pausable.sol';

contract RockPaperScissors is Pausable {

    enum Choices { None, Rock, Paper, Scissors }
    enum Outcomes { None, Draw, PlayerOneWinner, PlayerTwoWinner }

    struct PlayerStruct {
        uint        balance;
        bool        isInGame;
    }

    struct GameStruct {
        address     playerOne;
        bytes32     playerOneChoiceConceiled;
        bytes32     playerOneChoiceReveiled;
        address     playerTwo;
        bytes32     playerTwoChoiceConceiled;
        bytes32     playerTwoChoiceReveiled;
        uint        gameStake;
        Outcomes    gameWinner;
    }

    uint public gameNumber;
    uint public correctDepositAmount;
    
    mapping(uint => GameStruct) private gameStructs;
    mapping(bytes32 => mapping(bytes32 => Outcomes)) public playerOptions;
    mapping(address => PlayerStruct) private playerBalances;
    
    event LogDeposit(address sender, uint deposit);
    event LogPlayer(address sender, uint gameNumber, uint playerNumber, bytes32 hashedChoiceWithSecretKey);
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
    
    function playerChoice(bytes32 hashedChoiceWithSecretPin)
        public
        payable
        isActive
        returns(uint _gameNumber)
    {
        require(msg.value == correctDepositAmount);
        playerBalances[msg.sender].balance += msg.value;
        LogDeposit(msg.sender, msg.value);

        GameStruct memory game = gameStructs[gameNumber];
        game.gameStake = correctDepositAmount;
        
        if(game.playerOne == 0) {
            playerBalances[msg.sender].isInGame = true;
            game.playerOne = msg.sender;
            game.playerOneChoiceConceiled = hashedChoiceWithSecretPin;
            LogPlayer(msg.sender, gameNumber, 1, game.playerOneChoiceConceiled);
        } else if(game.playerTwo == 0) {
            require(msg.sender != game.playerOne);
            game.playerTwo = msg.sender;
            game.playerTwoChoiceConceiled = hashedChoiceWithSecretPin;
            LogPlayer(msg.sender, gameNumber, 2, game.playerTwoChoiceConceiled);
        }
        
        gameStructs[gameNumber] = game;
        
        return gameNumber;
    }
    
    function playerRevealForResult(uint _gameNumber, uint secretPin)
        public
        payable
        isActive
        returns(bool success)
    {
        require(secretPin > 0);
        GameStruct memory game = gameStructs[_gameNumber];
        require(msg.sender == game.playerOne || msg.sender == game.playerTwo);
        
        if(msg.sender == game.playerOne) {
            if(game.playerOneChoiceConceiled == keccak256(keccak256(Choices.Rock), secretPin)) {
                game.playerOneChoiceReveiled = keccak256(Choices.Rock);
            } else if(game.playerOneChoiceConceiled == keccak256(keccak256(Choices.Paper), secretPin)) {
                game.playerOneChoiceReveiled = keccak256(Choices.Paper);
            } else if(game.playerOneChoiceConceiled == keccak256(keccak256(Choices.Scissors), secretPin)) {
                game.playerOneChoiceReveiled = keccak256(Choices.Scissors);
            } else {
                require(false);
            }
        } else if(msg.sender == game.playerTwo) {
            if(game.playerTwoChoiceConceiled == keccak256(keccak256(Choices.Rock), secretPin)) {
                game.playerTwoChoiceReveiled = keccak256(Choices.Rock);
            } else if(game.playerTwoChoiceConceiled == keccak256(keccak256(Choices.Paper), secretPin)) {
                game.playerTwoChoiceReveiled = keccak256(Choices.Paper);
            } else if(game.playerTwoChoiceConceiled == keccak256(keccak256(Choices.Scissors), secretPin)) {
                game.playerTwoChoiceReveiled = keccak256(Choices.Scissors);
            } else {
                require(false);
            }
        }
        
        if((game.playerOneChoiceReveiled != 0x0) && (game.playerTwoChoiceReveiled != 0x0)) {
            Outcomes gameResult = playerOptions[game.playerOneChoiceReveiled][game.playerTwoChoiceReveiled];
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
        
        gameStructs[gameNumber] = game;
        
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
    
    /** Pure */
    
    function saltedChoiceHash(Choices _playerChoice, uint secretPin)
        public
        pure
        returns(bytes32 hashedPassword)
    {    
        return keccak256(keccak256(_playerChoice), secretPin);
    }
    
    /** Getters */

    function getGameStruct(uint index) 
        public
        view
        returns(GameStruct gameStruct)
    {
        return gameStructs[index];
    }

    function getPlayerStruct(address player)
        public
        view
        returns(PlayerStruct playerStruct)
    {
        return playerBalances[player];
    }
   
}
