const keccak256 = require("keccak256");
const dotenv = require("dotenv");
dotenv.config();

// TODO add addresses
const MISSING_GITCOIN_CONTRIBUTORS = [];

const ERC721_ADDRESS = "0x6B2E5BefDbb1D85104618Ea21301A5Dd8e5A74a6";

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log("Running deployment script with the account:", await deployer.getAddress());

  // load SimpleFiOG contract
  const erc721 = await ethers.getContractAt("SimpleFiOG", ERC721_ADDRESS);

  // deploy contract
  const DistributorFactory = await ethers.getContractFactory("Erc721WhitelistDistributor");
  const distributor = await DistributorFactory.deploy(erc721.address, MISSING_GITCOIN_CONTRIBUTORS);
  await distributor.deployed();
  console.log("Whitelist distributor deployed at: ", distributor.address);

  // Grant MINTER_ROLE to whitelist distributor contract
  await erc721.grantRole(keccak256("MINTER_ROLE"), distributor.address);
  console.log("Whitelist distributor has been granted role MINTER_ROLE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
