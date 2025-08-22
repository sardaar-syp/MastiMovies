const MastiMovies = artifacts.require("MastiMovies");

module.exports = function(deployer) {
  deployer.deploy(MastiMovies);
};