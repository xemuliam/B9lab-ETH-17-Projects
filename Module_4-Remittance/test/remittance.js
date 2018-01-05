var Remittance = artifacts.require("./Remittance.sol");

const Promise = require("bluebird");

if(typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll( web3.eth, { suffix: "Promise" } );
}

contract('Remittance', function(accounts) {
  
  var myContract;

  const senderAlice = accounts[0]; 
  const shopCarol = accounts[1];
  const recipientBob = accounts[2];

  const amountToFund = web3.toWei(1, "ether");
  const amountToSend = web3.toWei(0.1, "ether");

  var numBlocksUntilTimeout = 1;
  
  beforeEach( function() {
    return Remittance.new(numBlocksUntilTimeout, { from: senderAlice })
      .then( function( instance ) {
        myContract = instance;
      });
  });

  it("should be owned by the senderAlice", function() {
    return myContract.getOwner()
    .then( _senderAlice => {
        assert.strictEqual( _senderAlice, senderAlice, "Contract is not owned by senderAlice" );
    });
  });

  it("should create a remittance and process it successfully", function() {
    let password1, password2, suppliedHash;
    let startBalance, gasPrice, gasUsed, txFee, endBalance;

    password1 = 'passwordOne';
    password2 = 'passwordTwo';

    return web3.eth.getBalancePromise(shopCarol)
    .then(function (balance) {
        startBalance = balance;
        return myContract.createHash(recipientBob, password1, password2);
    })
    .then( responseData => {
        suppliedHash = responseData;
        return myContract.sendRemittance(amountToSend, shopCarol, recipientBob, suppliedHash, { from: senderAlice, value: amountToFund });
    })
    .then( txObj => {
        gasUsed = txObj.receipt.gasUsed;
        assert.strictEqual( txObj.logs[0].args.deposit.toString(10), amountToFund, "Contract not funded by the correct amount" );
        return web3.eth.getTransactionPromise(txObj.tx);
    })
    .then( txObj => {
        gasPrice = txObj.gasPrice;
        txFee = gasPrice.times(gasUsed);
        return myContract.requestWithdraw(suppliedHash, { from: shopCarol });
    })
    .then( txObj => {
        assert.strictEqual( txObj.logs[0].args.requestAmount.toString(10), amountToSend, "Remittance was not processed successfully" );
        return web3.eth.getBalancePromise(shopCarol);
    })
    .then(function (balance) {
        endBalance = balance;
        // there is a diffeence of 1904800000000000 (0.0019048 Eth), not sure where that is coming from.
        // gas used: 73777, gas price: 100000000000, txfee: 7377700000000000
        assert.strictEqual( startBalance.plus(amountToSend).minus(txFee).toString(10), endBalance.toString(10), "The shop did not receive the remittance");
        // + expected - actual
        // -101794110100000000000
        // +101796014900000000000
    });

  });

});