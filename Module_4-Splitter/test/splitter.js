var Splitter = artifacts.require("./Splitter.sol");

contract('Contract', function(accounts) {
  
  var contract;
  var ownerAlice = accounts[0]; 
  var personBob = accounts[1]; 
  var personCarol = accounts[2];

  beforeEach(function() {
    return Splitter.new(personBob, personCarol, {from : ownerAlice})
      .then(function(instance) {
        contract = instance;
      });
  });

  /**

  TESTS TO FOLLOW ONCE I RESOLVE THE OPCODE ISSUE!

  */

});