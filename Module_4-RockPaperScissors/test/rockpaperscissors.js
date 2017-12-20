var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract('Contract', function(accounts) {

    const Choices = {
        None: 0,
        Rock: 1,
        Paper: 2,
        Scissors: 3
    };

    var myContract;
    var playerOneRock;
    var playerOnePaper;
    var playerOneScissors;
    var playerTwoRock;
    var playerTwoPaper;
    var playerTwoScissors;

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
                    return myContract.saltedChoiceHash( Choices.Rock, playerOnePin, { from:playerOne } );
                })
                .then( receivedValue => {
                    playerOneRock = receivedValue;
                    return myContract.saltedChoiceHash( Choices.Paper, playerOnePin, { from:playerOne } );
                }) 
                .then( receivedValue => {
                    playerOnePaper = receivedValue;
                    return myContract.saltedChoiceHash( Choices.Scissors, playerOnePin, { from:playerOne } );
                })
                .then( receivedValue => {
                    playerOneScissors = receivedValue;
                    return myContract.saltedChoiceHash( Choices.Rock, playerTwoPin, { from:playerTwo } );
                })
                .then( receivedValue => {
                    playerTwoRock = receivedValue;
                    return myContract.saltedChoiceHash( Choices.Paper, playerTwoPin, { from:playerTwo } );
                })
                .then( receivedValue => {
                    playerTwoPaper = receivedValue;
                    return myContract.saltedChoiceHash( Choices.Scissors, playerTwoPin, { from:playerTwo } );
                })
                .then( receivedValue => {
                    playerTwoScissors = receivedValue;
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

        /** TODO:
            The variables used below in the forEach array are not defined because the beforeEach has not run yet.
            The beforeEach runs before each test but this forEach loop runs the test so the variables are not defined
            yet. If you console.log the variables within the test they are defined. I need to find a way to initialise
            the variables from the beforeEach above another way. I need those variables initialised globally before
            any of the tests start. 
        */

        [
            [ playerOneRock, playerTwoScissors, 1 ],
            [ playerOnePaper, playerTwoRock, 1 ],
            [ playerOneScissors, playerTwoRPaper, 1 ],
        ].forEach( winningChoices => {
            let playerOneChoice, playerTwoChoice, expectedWinner;

            playerOneChoice = winningChoices[0];
            playerTwoChoice = winningChoices[1];
            expectedWinner = winningChoices[2];

            console.log(playerOneChoice);
            console.log(playerTwoChoice);

            it("player one: " + winningChoices[0] + "; " + "player two: " + winningChoices[1] + "; expected winner: " + winningChoices[2], function() {

                return myContract.playerChoice( playerOneChoice, { from:playerOne, value:correctDepositAmount } )
                    .then( receivedValue => {
                        console.log(receivedValue);
                        return myContract.playerChoice( playerTwoChoice, { from:playerTwo, value:correctDepositAmount } );
                    })
                    .then( receivedValue => {  
                        cosno
                        assert.equal( receivedValue.logs[2].args.gameResult, expectedWinner, "unexpected winner" );
                    });

            });

        });

        [
            [ playerOneRock, playerTwoScissors, 2 ],
            [ playerOnePaper, playerTwoRock, 2 ],
            [ playerOneScissors, playerTwoRPaper, 2 ],
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