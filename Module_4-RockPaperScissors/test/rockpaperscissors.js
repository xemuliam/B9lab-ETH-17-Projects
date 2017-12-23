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
    const playerOnePin = 123;
    const playerTwoPin = 456;
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
            [ Choices.Rock, playerOnePin, Choices.Scissors, playerTwoPin, 1 ],
            [ Choices.Paper, playerOnePin, Choices.Rock, playerTwoPin, 1 ],
            [ Choices.Scissors, playerOnePin, Choices.Paper, playerTwoPin, 1 ],
        ].forEach( winningChoices => {
            let playerOneChoice, playerOnePin, playerTwoChoice, playerTwoPin, expectedWinner;
            let playerOneHash, playerTwoHash;
            let gameNumber;

            playerOneChoice = winningChoices[0];
            playerOnePin = winningChoices[1];
            playerTwoChoice = winningChoices[2];
            playerTwoPin = winningChoices[3];
            expectedWinner = winningChoices[4];           

            it("player one: " + winningChoices[0] + "; " + "player two: " + winningChoices[2] + "; expected winner: " + winningChoices[4], function() {
                return myContract.saltedChoiceHash( playerOneChoice, playerOnePin, { from:playerOne } )
                .then( receivedValue => {
                    playerOneHash = receivedValue;
                    return myContract.saltedChoiceHash( playerTwoChoice, playerTwoPin, { from:playerTwo } );
                })
                .then( receivedValue => {
                    playerTwoHash = receivedValue;
                    return myContract.playerChoice( playerOneHash, { from:playerOne, value:correctDepositAmount } );
                })
                .then( txObj => {
                    return myContract.playerChoice( playerTwoHash, { from:playerTwo, value:correctDepositAmount } );
                })
                .then( txObj => {
                    gameNumber = parseInt(txObj.logs[1].args.gameNumber);
                    return myContract.playerRevealForResult( gameNumber, playerOnePin, { from:playerOne } );
                })
                .then( txObj => {
                    return myContract.playerRevealForResult( gameNumber, playerTwoPin, { from:playerTwo } );
                })
                .then( txObj => {
                    assert.equal( (parseInt(txObj.logs[0].args.gameResult) - 1), expectedWinner, "unexpected winner" );
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