var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract('Contract', function(accounts) {

  const Choices = {
    None: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3
  };
  
  var myContract;

  const owner = accounts[0]; 
  const playerOne = accounts[1]; 
  const playerTwo = accounts[2]; 

  const correctDepositAmount = 100000000000000000;
  const incorrectDepositAmount = 200000000000000000;

  beforeEach( function() {
    return RockPaperScissors.new( correctDepositAmount, { from : owner } )
      .then( function( instance ) {
        myContract = instance;
      });
  });

  it("should be owned by the owner", function() {
    return myContract.getOwner( { from:owner } )
    .then( _owner => {
        assert.strictEqual( _owner, owner, "Contract is not owned by owner");
    });
  });

  it("should have the correct deposit amount set after creation", function() {
    return myContract.correctDepositAmount( { from:owner } )
    .then( receivedValue => {
      assert.equal( receivedValue.toString(10), correctDepositAmount, "constructor deposit amount not set" );
    });
  });

  it("should have players register with the correct deposit amount", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      assert.equal( txDeposit.logs[0].args.deposit.toString(10), correctDepositAmount, "player one registered with the incorrect deposit amount" );
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        assert.equal( txDeposit.logs[0].args.deposit.toString(10), correctDepositAmount, "player two registered with the incorrect deposit amount" );
      });
  });

  it("should have player one and two draw with Rock", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerTwo } );
      })
      .then( receivedValue => {  
        return myContract.playerChoice( receivedValue, { from:playerTwo } );
      })
      .then( receivedValue => {
        assert.equal( receivedValue.logs[1].args.result, 0, "should have been a draw" );
      });
  });

  it("should have player one win with Paper and player two with Rock", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        return myContract.getChoiceBytes32( Choices.Paper, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerTwo } );
      })
      .then( receivedValue => {
        assert.equal( receivedValue.logs[1].args.result, 1, "player one should have won" );
      });
  });

  it("should have player two win with Rock and player one with Scissors", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        return myContract.getChoiceBytes32( Choices.Scissors, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerTwo } )
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerTwo } )
      })
      .then( receivedValue => {
        assert.equal( receivedValue.logs[1].args.result, 2, "player two should have won" );
      });
  });

  it("should have player one withdraw their winnings", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        return myContract.getChoiceBytes32( Choices.Paper, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.withdraw( { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.recipientStructs( playerOne, { from:owner } );
      })
      .then ( receivedValue => {
        assert.equal( receivedValue[0].toString(10), 0, "The player one should have a nil balance after withdrawl" );
      });
  });

  it("should have player two withdraw their winnings", function() {
    return myContract.register( { from:playerOne, value:correctDepositAmount } )
    .then( function(txDeposit) {
      return myContract.register( { from:playerTwo, value:correctDepositAmount } );
      })
      .then( function(txDeposit) {
        return myContract.getChoiceBytes32( Choices.Rock, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerOne } );
      })
      .then( receivedValue => {
        return myContract.getChoiceBytes32( Choices.Paper, { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.playerChoice( receivedValue, { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.withdraw( { from:playerTwo } );
      })
      .then( receivedValue => {
        return myContract.recipientStructs( playerTwo, { from:owner } )
      })
      .then ( receivedValue => {
        assert.equal( receivedValue[0].toString(10), 0, "The player two should have a nil balance after withdrawl" );
      });
  });

  it("should have a contract that is not paused on creation", function() {
    return myContract.isPaused( { from:owner } )
    .then( receivedValue => {
      assert.isNotOk( receivedValue, "The contract is paused on creation" );
    });
  });

  it("should have a contract that is paused after being paused", function() {
    return myContract.pauseContract( { from:owner } )
    .then( receivedValue => {
      return myContract.isPaused( { from:owner } );
      })
      .then( receivedValue => {
        assert.isOk( receivedValue, "The contract is not paused after being paused" );
      });
  });

  it("should have a contract that is resumed after being paused", function() {
    return myContract.pauseContract( { from:owner } )
    .then( receivedValue => {
      return myContract.startContract( { from:owner } );
      })
      .then( receivedValue => {
        return myContract.isPaused( { from:owner } );
      })
      .then( receivedValue => {
        assert.isNotOk( receivedValue, "The contract is paused after being resumed" );
      });
  });

});
