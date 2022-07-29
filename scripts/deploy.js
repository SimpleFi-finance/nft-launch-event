const dotenv = require('dotenv');
dotenv.config();
const keccak256 = require("keccak256");

const { NFT_NAME, NFT_SYMBOL, IPFS_CID } = process.env;
console.log(NFT_NAME, NFT_SYMBOL, IPFS_CID);

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

  // deploy erc721
  const NFT = await ethers.getContractFactory("SimpleFiLaunchNft");
  const nft = await NFT.deploy(NFT_NAME, NFT_SYMBOL, IPFS_CID);
  await nft.deployed();
  console.log("SimpleFiLaunchNft address:", nft.address);


  // deploy whitelister
  const WhitelisterFactory = await ethers.getContractFactory("Erc721WhitelistDistributor");
  whitelister = await WhitelisterFactory.deploy(nft.address, []);
  console.log("whitelister address:", whitelister.address);

  // enable whitelister to mint NFTs for users
  await nft.grantRole(keccak256("MINTER_ROLE"), whitelister.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFilesForFrontend(whitelister);
}

function saveFilesForFrontend(distributor) {
  const fs = require("fs");
  const contractsDir = __dirname;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(
      {
        Erc721WhitelistDistributor: distributor.address,
      },
      undefined,
      2
    )
  );

  const distributorArtifact = artifacts.readArtifactSync("Erc721WhitelistDistributor");
  fs.writeFileSync(
    contractsDir + "/Erc721WhitelistDistributor.json",
    JSON.stringify(distributorArtifact, null, 2)
  );

  const erc721EnumberableArtifact = artifacts.readArtifactSync("SimpleFiLaunchNft");
  fs.writeFileSync(
    contractsDir + "/ERC721Enumberable.json",
    JSON.stringify(erc721EnumberableArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
