var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract('Contract', function(accounts) {

  const Choices = {
    Rock: 0,
    Paper: 1,
    Scissors: 2 
  };

  var myContract;

  const owner = accounts[0]; 
  const playerOne = accounts[1]; 
  const playerTwo = accounts[2]; 
  const correctDepositAmount = 100000000000000000;

  describe("RockPaperScissors", function() {

    beforeEach( function() {
      return RockPaperScissors.new( correctDepositAmount, { from : owner } )
      .then( function( instance ) {
        myContract = instance;
      });
    });

    it("should be owned by the owner", function() {
      return myContract.getOwner( { from:owner } )
      .then( receivedValue => {
        assert.strictEqual( receivedValue, owner, "Contract is not owned by owner");
      });
    });

    it("should have the correct deposit amount set after creation", function() {
      return myContract.correctDepositAmount( { from:owner } )
      .then( receivedValue => {
        assert.equal( receivedValue.toString(10), correctDepositAmount, "constructor deposit amount not set" );
      });
    });

    it("should have a positive result with winning choices", function() {

      [
        [ Choices.Rock, Choices.Scissors, 1 ],
        [ Choices.Paper, Choices.Rock, 1 ],
        //[ Choices.Scissors, Choices.Paper, 1 ],
      ].forEach( winningChoices => {

        return myContract.playerChoice( winningChoices[0], { from:playerOne, value:correctDepositAmount } )
        .then( receivedValue => {
          return myContract.playerChoice( winningChoices[1], { from:playerTwo, value:correctDepositAmount } );
        })
        .then( receivedValue => {  
          assert.equal( receivedValue.logs[2].args.gameResult, winningChoices[2], "unexpected player one" );
        });

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

});
