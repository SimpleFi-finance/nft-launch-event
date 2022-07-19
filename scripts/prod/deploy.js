const fs = require("fs");
const keccak256 = require("keccak256");
const dotenv = require('dotenv');

dotenv.config();

const { NFT_NAME, NFT_SYMBOL, IPFS_CID, OPENSEA_POLYGON_PROXY } = process.env;

async function deployNFT() {
  const NFTFactory = await ethers.getContractFactory("SimpleFiOG");
  const NFT = await NFTFactory.deploy(NFT_NAME, NFT_SYMBOL, `ipfs://${IPFS_CID}/`, OPENSEA_POLYGON_PROXY);
  await NFT.deployed();

  console.log("NFT deployed at:", NFT.address);
  return NFT;
}

async function deployMerkleDistributor(NFT) {
  const file = "./frontend/src/merkle.json";
  const merkleInfo = JSON.parse(fs.readFileSync(file));
  console.log("Deploying Merkle Distributor with merkle root: ", merkleInfo.root);
  
  const merkleDistributorFactory = await ethers.getContractFactory("Erc721MerkleDistributor");
  const merkleDistributor = await merkleDistributorFactory.deploy(NFT.address, merkleInfo.root);
  await merkleDistributor.deployed();
  
  console.log("Merkle Distributor deployed at: ", merkleDistributor.address);

  // Grant MINTER_ROLE to merkle distributor contract on the NFT
  await NFT.grantRole(keccak256("MINTER_ROLE"), merkleDistributor.address);
  console.log("Merkle Distributor has been granted MINTER_ROLE");

  return merkleDistributor
}

function saveFilesForFrontend(merkleDistributor) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(
      {
        Erc721MerkleDistributor: merkleDistributor.address,
      },
      undefined,
      2
    )
  );

  const distributorArtifact = artifacts.readArtifactSync("Erc721MerkleDistributor");
  fs.writeFileSync(
    contractsDir + "/Erc721MerkleDistributor.json",
    JSON.stringify(distributorArtifact, null, 2)
  );

  const erc721EnumerableArtifact = artifacts.readArtifactSync("ERC721Enumerable");
  fs.writeFileSync(
    contractsDir + "/ERC721Enumerable.json",
    JSON.stringify(erc721EnumerableArtifact, null, 2)
  );
}

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
  console.log("Running deployment script with the account:", await deployer.getAddress());

  // Deploy NFT contract
  const NFT = await deployNFT();

  // Deploy Merkle Distributor
  const merkleDistributor = await deployMerkleDistributor(NFT);

  // Save artifact files for frontend
  saveFilesForFrontend(merkleDistributor);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });