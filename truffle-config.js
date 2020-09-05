const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config()

const infuraKey = process.env.INFURA_KEY;
const mnemonic = process.env.MNEMONIC;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networkCheckTimeout: 10000,
  networks: {
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4      
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    matic: {
      provider: () => {
        return new HDWalletProvider(mnemonic, "https://rpc-mumbai.matic.today");
      },
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  mocha: {
    enableTimeouts: false,
    before_timeout: 120000
}
};
