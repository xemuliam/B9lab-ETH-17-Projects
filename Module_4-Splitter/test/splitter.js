/**
 I used, "https://github.com/albertpul/ethereum-splitter-contract/blob/master/test/splitter.js" as a
 reference for the unit tests as it is my first one and wasn't quite sure where to start.
*/

var Splitter = artifacts.require("./Splitter.sol");

contract('Contract', function(accounts) {
  
  var contract;
  var ownerAlice = accounts[0]; 
  var personBob = accounts[1]; 
  var personCarol = accounts[2];

  const amountToSplit = web3.toWei(0.2,"ether");
  const expectedShare = web3.toWei(0.1,"ether");

  beforeEach( function(){
      return Splitter.new( personBob, personCarol, {from : ownerAlice})
      .then( function(instance){
        contract = instance;
      });
  });

  it("should be owned by ownerAlice", function(){
    return contract.ownerAlice( {from:ownerAlice})
    .then( _ownerAlice => {
        assert.strictEqual( _ownerAlice, ownerAlice, "Contract is not owned by ownerAlice");
    });
  });

  it("should have the correct split to addresses", function(){
    return contract.personBob( {from:ownerAlice})
    .then( function( _a) {
        assert.strictEqual( _a, personBob, "Split A address is not correct");
        return contract.personCarol( {from:ownerAlice})
    }).then( function( _b)  {
        assert.strictEqual( _b, personCarol, "Split B address is not correct");
    });
  });

  it("accountA should have no BalanceOf after contract creation", function(){
    return contract.getBalanceOf.call( personBob, {from: personBob})
    .then( function(_BalanceOf){
        assert.equal(_BalanceOf, 0, "Account A has available funds after contract creation")
    });
  });

  it("accountB should have no BalanceOf after contract creation", function(){
    return contract.getBalanceOf.call( personCarol, {from: personCarol})
    .then( function(_BalanceOf){
        assert.equal(_BalanceOf, 0, "Account B has available funds after contract creation");
    });
  });


  it("should split the transfer amount between the other two contracts available Funds", function(){
    return contract.split({from:ownerAlice, value: amountToSplit})
    .then( function(txSplit) {
    return contract.getBalanceOf.call( personBob, {from: personBob})})
    .then( function(_BalanceOf){
        assert.equal(_BalanceOf.toString(10),  expectedShare, "Account A available funds not increased after split");
        return contract.getBalanceOf.call( personCarol,  {from: personCarol})})
    .then( function(_BalanceOf){
        assert.equal(_BalanceOf.toString(10),  expectedShare, "Account B available funds not increased after split");
    });
  });

  it("should emit Split event and include all 5 arguments", function(){
      return contract.split({from:ownerAlice, value: amountToSplit})
    .then( function(txSplit) {
      assert.equal(txSplit.logs.length,1, "Split Event not emitted");
      assert.strictEqual(txSplit.logs[0].event,"LogSplit", "Event emitted is not Split");
      assert.strictEqual(txSplit.logs[0].args.from, ownerAlice, "Split Event from argument not included or incorrect value");
      assert.strictEqual(txSplit.logs[0].args.toA, personBob, "Split Event toA argument not included or incorrect value");
      assert.strictEqual(txSplit.logs[0].args.toB, personCarol, "Split Event  toB argument not included or incorrect value");
      assert.equal(txSplit.logs[0].args.value.toNumber(), amountToSplit*1, "Split Event  value argument not included or incorrect value");
      assert.equal(txSplit.logs[0].args.valueSplit.toNumber(), expectedShare*1, "Split Event valueSplit argument not included or incorrect value");
    });
  });

  it("should allow withdraw from any of the two accounts and set balance to zero", function() {
   
    return contract.split({from:ownerAlice, value: amountToSplit})
    .then( function(txSplit){
      return contract.withdrawFunds({from:personBob})})
    .then( function(_txWithDraw){
       return contract.withdrawFunds({from:personCarol})})
    .then( function(_success){
      return contract.getBalanceOf.call(personBob, {from:personBob})})
    .then( function(_balance){
      assert.strictEqual(_balance.toNumber(), 0, "Withdraw not removing all pending balance for Account A");
      return contract.getBalanceOf.call(personCarol, {from:personCarol})})
    .then( function(_balance){
      assert.strictEqual(_balance.toNumber(), 0, "Withdraw not removing all pending balance for Account B");
   });
  });

});