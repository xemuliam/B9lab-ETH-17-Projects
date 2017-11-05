var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

contract('Contract', function(accounts) {

  var contract;
  var owner = accounts[0];

  const requiredEtherAmount = web3.toWei(5, "ether");

  beforeEach( function(){
      return RockPaperScissors.new( requiredEtherAmount, { from : owner } )
      .then( function(instance){
        contract = instance;
      });
  });

  it("should be owned by owner", function(){
    return contract.owner( { from:owner } )
    .then( _owner => {
        assert.strictEqual( _owner, owner, "Contract is not owned by owner" );
    });
  });

  /** TESTS TO FOLLOW */

});