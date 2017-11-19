// dependencies

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
require("file-loader?name=../index.html!../index.html");

// and our contract

const remittanceJson = require("../../build/contracts/Remittance.json");

// support Mist, and other wallets that provide 'web3'

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    console.log("web3 is not undefined so using Mist");
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    console.log("web3 is undefined so using the fallback.");
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise"});
Promise.promisifyAll(web3.version, { suffix: "Promise"});

const Remittance = truffleContract(remittanceJson);
Remittance.setProvider(web3.currentProvider);

// now, discover the balance and update the web UI
window.addEventListener('load', function() {
    console.log(Remittance);
});
