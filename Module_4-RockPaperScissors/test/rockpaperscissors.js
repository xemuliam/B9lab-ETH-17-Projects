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

        [
            [ Choices.Rock, Choices.Scissors, 1 ],
            [ Choices.Paper, Choices.Rock, 1 ],
            [ Choices.Scissors, Choices.Paper, 1 ],
        ].forEach( winningChoices => {
            let playerOneChoice, playerTwoChoice, expectedWinner;

            playerOneChoice = winningChoices[0];
            playerTwoChoice = winningChoices[1];
            expectedWinner = winningChoices[2];

            it("player one: " + winningChoices[0] + "; " + "player two: " + winningChoices[1] + "; expected winner: " + winningChoices[2], function() {

                return myContract.playerChoice( playerOneChoice, { from:playerOne, value:correctDepositAmount } )
                    .then( receivedValue => {
                        return myContract.playerChoice( playerTwoChoice, { from:playerTwo, value:correctDepositAmount } );
                    })
                    .then( receivedValue => {  
                        assert.equal( receivedValue.logs[2].args.gameResult, expectedWinner, "unexpected winner" );
                    });

            });

        });

        [
            [ Choices.Rock, Choices.Scissors, 2 ],
            [ Choices.Paper, Choices.Rock, 2 ],
            [ Choices.Scissors, Choices.Paper, 2 ],
        ].forEach( winningChoices => {
            let playerOneChoice, playerTwoChoice, expectedLoser;

            playerOneChoice = winningChoices[0];
            playerTwoChoice = winningChoices[1];
            expectedLoser = winningChoices[2];

            it("player one: " + winningChoices[0] + "; " + "player two: " + winningChoices[1] + "; expected loser: " + winningChoices[2], function() {

                return myContract.playerChoice( playerOneChoice, { from:playerOne, value:correctDepositAmount } )
                    .then( receivedValue => {
                        return myContract.playerChoice( playerTwoChoice, { from:playerTwo, value:correctDepositAmount } );
                    })
                    .then( receivedValue => {  
                        assert.notEqual( receivedValue.logs[2].args.gameResult, expectedLoser, "unexpected loser" );
                    });

            });

        });

        it("should have a contract that is not paused on creation", function() {
            return myContract.isPaused( { from:owner } )
                .then( receivedValue => {
                    assert.isFalse( receivedValue, "The contract is paused on creation" );
                });
        });

        it("should have a contract that is paused after being paused", function() {
            return myContract.pauseContract( { from:owner } )
                .then( receivedValue => {
                    return myContract.isPaused( { from:owner } );
                })
                .then( receivedValue => {
                    assert.isTrue( receivedValue, "The contract is not paused after being paused" );
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
                    assert.isFalse( receivedValue, "The contract is paused after being resumed" );
                });
        });

    });

});
