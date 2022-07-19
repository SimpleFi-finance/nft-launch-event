const fs = require("fs");

async function main() {
  // ethers is avaialble in the global scope
  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contract with the account:", await deployer.getAddress());

  // ERC721 is deployed here
  const ERC721_ADDRESS = "0x44eaC5D1CaEd703EcA9e5A77295B24e27C57037e";

  // deploy distributor
  const file = "./frontend/src/merkle.json";
  const merkleInfo = JSON.parse(fs.readFileSync(file));
  const DistributorFactory = await ethers.getContractFactory("Erc721MerkleDistributor");
  const distributor = await DistributorFactory.deploy(ERC721_ADDRESS, merkleInfo.root);
  await distributor.deployed();
  console.log("Distributor deployed at: ", distributor.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFilesForFrontend(distributor);
}

function saveFilesForFrontend(distributor) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../nft-dropper-client/nft-drop/src/contracts/";

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
