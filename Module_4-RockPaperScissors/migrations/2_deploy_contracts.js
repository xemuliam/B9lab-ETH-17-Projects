var RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

module.exports = function(deployer) {
  deployer.deploy(RockPaperScissors, web3.toWei("0.1", "ether"));
};
