var Remittance = artifacts.require("./Remittance.sol");

module.exports = function(deployer) {
  deployer.deploy(Remittance, 17280); // ~3 days with an average block time of 15 seconds
};