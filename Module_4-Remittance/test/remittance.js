var Remittance = artifacts.require("./Remittance.sol");

contract('Contract', function(accounts) {
  
  var myContract;

  const senderAlice = accounts[0]; 
  const shopCarol = accounts[1];
  const recipientBob = accounts[2];

  const amountToFund = web3.toWei(1, "ether");
  const amountToSend = web3.toWei(0.1, "ether");

  var numBlocksUntilTimeout = 1;
  
  beforeEach( function() {
    return Remittance.new( numBlocksUntilTimeout, { from: senderAlice } )
      .then( function( instance ) {
        myContract = instance;
      });
  });

  it("should be owned by the senderAlice", function() {
    return myContract.getOwner( { from: senderAlice } )
    .then( _senderAlice => {
        assert.strictEqual( _senderAlice, senderAlice, "Contract is not owned by senderAlice" );
    });
  });

  it("should be funded by the correct amount", function() {
    return myContract.depositFunds( { from: senderAlice, value: amountToFund } )
    .then( txObj => {
        assert.strictEqual( txObj.logs[0].args.deposit.toString(10), amountToFund, "Contract not funded by the correct amount" );
    });
  });

  it("should create a remittance and process it successfully", function() {
    let password1, password2, expectedHash;

    password1 = 'passwordOne';
    password2 = 'passwordTwo';

    return myContract.createHash( recipientBob, password1, password2, { from: shopCarol } )
    .then( responseData => {
        expectedHash = responseData;
        return myContract.depositFunds( { from: senderAlice, value: amountToFund } )
    })
    .then( txObj => {
        assert.strictEqual( txObj.logs[0].args.deposit.toString(10), amountToFund, "Contract not funded by the correct amount" );
        return myContract.sendRemittance( amountToSend, shopCarol, password1, recipientBob, password2, { from: senderAlice } );
    })
    .then( responseData => {
        return myContract.requestWithdraw( recipientBob, expectedHash, { from: shopCarol } );
    })
    .then( txObj => {
        assert.strictEqual( txObj.logs[0].args.requestAmount.toString(10), amountToSend, "Remittance was not processed successfully" );
    });
  });

});