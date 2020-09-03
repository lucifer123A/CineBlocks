var FactoryContract = artifacts.require("./FactoryContract.sol");

module.exports = function(deployer) {
  deployer.deploy(FactoryContract);
};
