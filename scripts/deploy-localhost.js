const fs = require("fs");
const keccak256 = require("keccak256");

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
  console.log("Deploying the contracts with the account:", await deployer.getAddress());

  // deploy ERC721
  const ERC721Factory = await ethers.getContractFactory("ERC721PresetMinterPauserAutoId");
  const NFT_URI = "ipfs://QmPM2wDykpkBNyLdQs86qfFnu7LrkFJ1RTFiYk5FxhLuH4/";
  erc721 = await ERC721Factory.deploy("SimpleFi OG NFT drop", "SIMP-OG", NFT_URI);
  await erc721.deployed();
  console.log("ERC721 deployed at: ", erc721.address);

  // deploy distributor
  const file = "./frontend/src/merkle.json";
  const merkleInfo = JSON.parse(fs.readFileSync(file));
  const DistributorFactory = await ethers.getContractFactory("Erc721MerkleDistributor");
  distributor = await DistributorFactory.deploy(erc721.address, merkleInfo.root);
  await distributor.deployed();
  console.log("Distributor deployed at: ", distributor.address);

  // enable distributor to mint NFTs for users
  await erc721.grantRole(keccak256("MINTER_ROLE"), distributor.address);
  console.log("Distributor is granted MINTER_ROLE");

  // We also save the contract's artifacts and address in the frontend directory
  saveFilesForFrontend(distributor);
}

function saveFilesForFrontend(distributor) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(
      {
        Erc721MerkleDistributor: distributor.address,
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
