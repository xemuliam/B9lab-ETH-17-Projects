// dependencies

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
require("file-loader?name=../index.html!../index.html");

// and our contract

const metaCoinJson = require("../../build/contracts/MetaCoin.json");

window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 

Promise.promisifyAll(web3.eth, { suffix: "Promise"});
Promise.promisifyAll(web3.version, { suffix: "Promise"});

const MetaCoin = truffleContract(metaCoinJson);
MetaCoin.setProvider(web3.currentProvider);

// now, discover the balance and update the web UI
window.addEventListener('load', function() {
    $("#send").click(sendCoin);
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if(accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
            window.account = accounts[0];
            // console.log("ACCOUNT:", window.account);
            return web3.version.getNetworkPromise();
        })
    .then(function(network) {
        return MetaCoin.deployed();
    })
    .then(deployed => deployed.getBalance.call(window.account))
        .then(balance => $("#balance").html(balance.toString(10)))
        .catch(console.error);
});

const sendCoin = function() {
    let deployed;
    return MetaCoin.deployed()
        .then(_deployed => {
            deployed = _deployed;
            // .sendTransaction so that we get the txHash immediately.
            return _deployed.sendCoin.sendTransaction(
                    $("input[name='recipient']").val(),
                    // Giving a string is fine
                    $("input[name='amount']").val(),
                    { from: window.account });
        })
    .then(txHash => {
        $("#status").html("Transaction on the way " + txHash);
        // Now we wait for the tx to be mined.
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
            .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(500).then(tryAgain));
        return tryAgain();
    })
    .then(receipt => {
        if (receipt.logs.length == 0) {
            console.error("Empty logs");
            console.error(receipt);
            $("#status").html("There was an error in the tx execution");
        } else {
            // Format the event nicely.
            console.log(deployed.Transfer().formatter(receipt.logs[0]).args);
            $("#status").html("Transfer executed");
        }
        // Make sure we update the UI.
        return deployed.getBalance.call(window.account);
    })
    .then(balance => $("#balance").html(balance.toString(10)))
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};
