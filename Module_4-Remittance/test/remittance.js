var Remittance = artifacts.require("./Remittance.sol");

contract('Contract', function(accounts) {
  
  var myContract;
  var owner = accounts[0]; 
  var numBlocksUntilTimeout = 1;
  
  beforeEach( function() {
    return Remittance.new( numBlocksUntilTimeout, { from : owner } )
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

  // TODO: tests to follow

});
