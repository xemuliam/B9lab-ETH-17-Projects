pragma solidity ^0.4.18;

import '../contractLibrary/contractModifiers/Pausable.sol';

contract RockPaperScissors is Pausable {

  enum Choices { None, Rock, Paper, Scissors }

  struct RecipientStruct {
    uint balance;
    bool exists;
  }  

  uint public correctDepositAmount;

  address public playerOne;
  address public playerTwo;

  address[] private recipients;
  mapping(address => RecipientStruct) public recipientStructs;

  bytes32 private playerOneChoice = keccak256(Choices.None);
  bytes32 private playerTwoChoice = keccak256(Choices.None);

  mapping (bytes32 => mapping(bytes32 => uint)) playerChoices;

  event LogRegistration(address sender, uint8 player, uint balance,  uint deposit);
  event LogPlayerChoice(address sender, uint8 player, bytes32 keccakChoice);
  event LogOutcome(address sender, address playerOne, bytes32 playerOneChoice, address playerTwo, bytes32 playerTwoChoice, uint result);
  event LogWithdraw(address sender, uint amount);

  function RockPaperScissors(uint depositAmount) 
    public 
  {
    correctDepositAmount = depositAmount;

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
    notRegisteredYet
    isActive
    returns (bool success)
  {
    require(msg.value == correctDepositAmount);
    require(!isRecipient(msg.sender));

    recipients.push(msg.sender);
    recipientStructs[msg.sender].exists = true;

    if(playerOne == 0) {
      playerOne = msg.sender;
      LogRegistration(msg.sender, 1, recipientStructs[msg.sender].balance, msg.value);
      recipientStructs[msg.sender].balance += msg.value;
      return true;
    }
    if((playerTwo == 0) && (playerOne != msg.sender)) {
      playerTwo = msg.sender;
      LogRegistration(msg.sender, 2, recipientStructs[msg.sender].balance,  msg.value);
      recipientStructs[msg.sender].balance += msg.value;
      return true;
    }

    return false;
  }

  function playerChoice(bytes32 keccakChoice)
    public
    isActive
    returns(uint winner)
  {
    require(playerOne == msg.sender || playerTwo == msg.sender);

    if(msg.sender == playerOne) {
      playerOneChoice = keccakChoice;
      LogPlayerChoice(msg.sender, 1, keccakChoice);
    }
    if(msg.sender == playerTwo) {
      playerTwoChoice = keccakChoice;
      LogPlayerChoice(msg.sender, 2, keccakChoice);
    }

    uint result = playerChoices[playerOneChoice][playerTwoChoice];
    LogOutcome(msg.sender, playerOne, playerOneChoice, playerTwo, playerTwoChoice, result);

    return result;    
  }

  function withdraw()
    public
    isActive
    returns(bool success)
  {
    uint payment = recipientStructs[msg.sender].balance;
    require(payment > 0);

    recipientStructs[msg.sender].balance = 0;
    LogWithdraw(msg.sender, payment);

    msg.sender.transfer(payment);

    return true;
  }

  function getChoiceBytes32(Choices choice)
    public
    pure
    returns(bytes32 choiceBytes32)
  {
    return keccak256(choice);
  }

  function isRecipient(address recipient) 
    public 
    constant 
    returns(bool isIndeed)
  {
    return recipientStructs[recipient].exists;
  }

  function getAddressCount() 
    public
    constant 
    returns(uint count) 
  { 
    return recipients.length; 
  }

}
