var Splitter = artifacts.require("./Splitter.sol");

contract('Contract', function(accounts) {
  
  var myContract;

  var ownerAlice = accounts[0]; 
  var personBob = accounts[1]; 
  var personCarol = accounts[2];

  const amountToSplit = web3.toWei(0.2, "ether");
  const expectedShare = web3.toWei(0.1, "ether");

  beforeEach( function() {
    return Splitter.new( { from : ownerAlice } )
      .then( function( instance ) {
        myContract = instance;
      });
  });

  it("should be owned by ownerAlice", function() {
    return myContract.ownerAlice( { from:ownerAlice } )
    .then( _ownerAlice => {
        assert.strictEqual( _ownerAlice, ownerAlice, "Contract is not owned by ownerAlice");
    });
  });

  it("should successfully register Bob and Carol", function() {
    return myContract.registerBobAndCarol( personBob, personCarol, { from:ownerAlice } )
      .then( txObj => {
        assert.equal( txObj.logs.length, 1, "Registration of Bob and Carol was not successful" );
        assert.isOk( txObj , "Registration of Bob and Carol was not successful" );
    });
  });

  it("should have the correct addresses", function() {
    return myContract.registerBobAndCarol( personBob, personCarol, { from:ownerAlice } )
    .then ( txObj => {
      assert.equal( txObj.logs.length, 1, "Registration of Bob and Carol was not successful" );
      assert.isOk( txObj , "Registration of Bob and Carol was not successful" );
      return myContract.personBob( { from:ownerAlice }  )
        .then( txObj => {
          assert.strictEqual( txObj, personBob, "Bob's address is not correct");
          return myContract.personCarol( { from:ownerAlice } )
        }).then( txObj => {
          assert.strictEqual( txObj, personCarol, "Carol's address is not correct");
        })
    });
  });

  it("should split the transfer amount from Alice between Bob and Carol", function() {
    return myContract.registerBobAndCarol( personBob, personCarol, { from:ownerAlice } )
    .then ( txObj => {
      return myContract.getBalanceBob.call( { from: personBob } )
      .then( function( txObj ) {
        var balanceBobBefore = txObj.toString(10);
        return myContract.getBalanceCarol.call( { from: personCarol } )
        .then( function( txObj ) {
          var balanceCarolBefore = txObj.toString(10);
          return myContract.deposit( { from:ownerAlice, value: amountToSplit } )
          .then( function(txSplit) {
            return myContract.getBalanceBob.call( { from: personBob } )
            .then( function( txObj ) {
              var balanceBobAfter = txObj.toString(10);
              return myContract.getBalanceCarol.call( { from: personCarol } )
              .then( function( txObj ) {
                var balanceCarolAfter = txObj.toString(10);
                return myContract.deposit( { from:ownerAlice, value: amountToSplit } )
                .then( function(txSplit) {
                  var balanceBobDiff = balanceBobAfter - balanceBobBefore;              
                  var balanceCarolDiff = balanceCarolAfter - balanceCarolBefore;
                  assert.equal(balanceBobDiff, expectedShare, "Bob has the incorrect share");
                  assert.equal(balanceCarolDiff, expectedShare, "Carol has the incorrect share");
                })
              })
            })
          })
        })
      })
    })
  });

});