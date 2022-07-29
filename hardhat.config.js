require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const dotenv = require("dotenv");
dotenv.config();

const { PRIVATE_KEY, POLYGON_NODE_URL, POLYGON_NODE_API_KEY, POLYGONSCAN_API_KEY } = process.env;

console.log(POLYGON_NODE_URL);

module.exports = {
  solidity: "0.8.1",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // forking: {
      //   url: `${POLYGON_NODE_URL}${POLYGON_NODE_API_KEY}`,
      // },
      // accounts: [{
      //   privateKey: `0x${PRIVATE_KEY}`,
      //   balance: "10000000000000000000000"
      // }],
    },
    polygon: {
      url: `${POLYGON_NODE_URL}${POLYGON_NODE_API_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    url: "https://polygonscan.com",
    apiKey: POLYGONSCAN_API_KEY,
  },
};
