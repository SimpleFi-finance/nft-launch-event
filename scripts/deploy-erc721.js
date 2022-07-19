const dotenv = require('dotenv');
dotenv.config();

const { NFT_NAME, NFT_SYMBOL, IPFS_CID, OPENSEA_POLYGON_PROXY } = process.env;

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const NFT = await ethers.getContractFactory("SimpleFiOG");
  const nft = await NFT.deploy(NFT_NAME, NFT_SYMBOL, `ipfs://${IPFS_CID}/`, OPENSEA_POLYGON_PROXY);
  await nft.deployed();

  console.log("NFT address:", nft.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(nft);
}

function saveFrontendFiles(nft) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ NFT: nft.address }, undefined, 2)
  );

  const NftArtifact = artifacts.readArtifactSync("ERC721PresetMinterPauserAutoId");

  fs.writeFileSync(
    contractsDir + "/ERC721PresetMinterPauserAutoId.json",
    JSON.stringify(NftArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
