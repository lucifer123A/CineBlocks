const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "e0545923a679490dbad2b378f01621ac";
const mnemonic = 'garment chase garbage excess lecture noble bachelor wet apart domain section card';

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
    },
    develop: {
      port: 8545
    }
  },
  mocha: {
    enableTimeouts: false,
    before_timeout: 120000
}
};
