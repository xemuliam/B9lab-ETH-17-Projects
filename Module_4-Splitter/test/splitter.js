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
      console.log(accounts[0]);
        assert.strictEqual( _ownerAlice, ownerAlice, "Contract is not owned by ownerAlice");
    });
  });

  it("should successfully register Bob and Carol", function() {
    return myContract.registerBobAndCarol( personBob, personCarol, { from:ownerAlice } )
      .then( _result => {
        assert.isOk( _result , "Registration of Bob and Carol was not successful" );
    });
  });

  it("should have the correct addresses", function() {
    return myContract.personBob();
  });

});