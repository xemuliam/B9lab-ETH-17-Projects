var Splitter = artifacts.require("./Splitter.sol");

contract('Contract', function(accounts) {
  
  var myContract;

  const owner = accounts[0]; 
  const recipientOne = accounts[1]; 
  const recipientTwo = accounts[2];

  const amountToSplit = web3.toWei(0.2, "ether");
  const expectedShare = web3.toWei(0.1, "ether");

  beforeEach( function() {
    return Splitter.new( { from : owner } )
      .then( function( instance ) {
        myContract = instance;
      });
  });

  it("should be owned by the owner", function() {
    return myContract.owner( { from:owner } )
    .then( _owner => {
        assert.strictEqual( _owner, owner, "Contract is not owned by owner");
    });
  });

  it("should successfully register two recipients", function() {
    return myContract.registerRecipient( recipientOne, { from:owner } )
    .then( receivedValue => {
      assert.equal( receivedValue.logs.length, 1, "Registration of the first recipient was not successful" );
      assert.strictEqual( receivedValue.logs[0].args.recipient, recipientOne, "Registration of the first recipient was not successful" );
      assert.isOk( receivedValue , "Registration of the first recipient was not successful" );
      return myContract.registerRecipient( recipientTwo, { from:owner } )
      .then( receivedValue => {
        assert.equal( receivedValue.logs.length, 1, "Registration of the second recipient was not successful" );
        assert.strictEqual( receivedValue.logs[0].args.recipient, recipientTwo, "Registration of the second recipient was not successful" );
        assert.isOk( receivedValue , "Registration of the second recipient was not successful" );
      });
    });
  });

  it("should have a nil balance for the first recipient after registration", function() {
    return myContract.registerRecipient( recipientOne, { from:owner } )
    .then( receivedValue => {
      return myContract.recipientStructs( recipientOne, { from:owner } )
      .then ( receivedValue => {
        assert.equal( receivedValue[0].toString(10), 0, "The first recipient does not have a nil balance on registration" );
      });
    });
  });

  it("should have a nil balance for the second recipient after registration", function() {
    return myContract.registerRecipient( recipientTwo, { from:owner } )
    .then( receivedValue => {
      return myContract.recipientStructs( recipientTwo, { from:owner } )
      .then ( receivedValue => {
        assert.equal( receivedValue[0].toString(10), 0, "The second recipient does not have a nil balance on registration" );
      });
    });
  });

  it("should split the transfer amount from the owner between the two recipients", function() {
    return myContract.registerRecipient( recipientOne, { from:owner } )
    .then( receivedValue => {
      return myContract.registerRecipient( recipientTwo, { from:owner } )
      .then( receivedValue => {
        return myContract.deposit( { from:owner, value: amountToSplit } )
        .then( function(txSplit) {
          return myContract.recipientStructs( recipientOne, { from:owner } )
          .then ( receivedValue => {
            assert.equal( receivedValue[0].toString(10), expectedShare, "The first recipient has the incorrect share" );
            return myContract.recipientStructs( recipientTwo, { from:owner } )
            .then ( receivedValue => {
              assert.equal( receivedValue[0].toString(10), expectedShare, "The second recipient has the incorrect share" );
            });
          });
        });
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
      return myContract.isPaused( { from:owner } )
      .then( receivedValue => {
        assert.isOk( receivedValue, "The contract is not paused after being paused" );
      });
    });
  });

  it("should have a contract that is resumed after being paused", function() {
    return myContract.pauseContract( { from:owner } )
    .then( receivedValue => {
      return myContract.startContract( { from:owner } )
      .then( receivedValue => {
        return myContract.isPaused( { from:owner } )
        .then( receivedValue => {
          assert.isNotOk( receivedValue, "The contract is paused after being resumed" );
        });
      });
    });
  });

  it("should allow a recipient to withdraw their funds", function() {
    return myContract.registerRecipient( recipientOne, { from:owner } )
    .then( receivedValue => {
      return myContract.registerRecipient( recipientTwo, { from:owner } )
      .then( receivedValue => {
        return myContract.deposit( { from:owner, value: amountToSplit } )
        .then( function(txSplit) {
          return myContract.recipientStructs( recipientOne, { from:owner } )
          .then ( receivedValue => {
            assert.equal( receivedValue[0].toString(10), expectedShare, "The first recipient has the incorrect share" );
            return myContract.withdraw( { from:recipientOne } )
            .then( receivedValue => {
              return myContract.recipientStructs( recipientOne, { from:owner } )
              .then ( receivedValue => {
                assert.equal( receivedValue[0].toString(10), 0, "The first recipient should have a nil balance after withdrawl" );
              });
            });
          });
        });
      });
    });
  });

});
