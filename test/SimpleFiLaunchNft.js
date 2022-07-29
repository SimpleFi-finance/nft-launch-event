const { expect } = require("chai");
const keccak256 = require("keccak256");
const { utils } = require("ethers");


describe("SimpleFi NFT collection", function () {
  let erc721;
  let whitelister;
  const { NFT_NAME, NFT_SYMBOL, IPFS_CID } = process.env;

  beforeEach(async function () {
    // Get list of addresses
    [user0, user1, user2, ...others] = await ethers.getSigners();
    users = [user0, user1, user2];

    // deploy ERC721
    const ERC721Factory = await ethers.getContractFactory("SimpleFiLaunchNft");
    erc721 = await ERC721Factory.deploy(NFT_NAME, NFT_SYMBOL, IPFS_CID);

    // deploy whitelister
    const WhitelisterFactory = await ethers.getContractFactory("Erc721WhitelistDistributor");
    whitelister = await WhitelisterFactory.deploy(erc721.address, []);

    // enable whitelister to mint NFTs for users
    await erc721.grantRole(keccak256("MINTER_ROLE"), whitelister.address);

    const x = ethers.utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));
    console.log(x);
  });

  describe("ERC721", function () {
    it("initial state is set correctly", async function () {
      expect(await erc721.name()).to.eq(NFT_NAME);
      expect(await erc721.symbol()).to.eq(NFT_SYMBOL);
      expect(await erc721.baseTokenURI()).to.eq(IPFS_CID);
    });

    it("whitelisted user can claim", async function () {
      const balanceBefore = await erc721.balanceOf(user1.address);
      expect(balanceBefore).to.eq(0);

      await whitelister.whitelistAccount(user1.address);
      await whitelister.connect(user1).claim();

      const balanceAfter = await erc721.balanceOf(user1.address);
      expect(balanceAfter).to.eq(1);
    });

    it("non-whitelisted user can't claim", async function () {
      const tx = whitelister.connect(user1).claim();
      await expect(tx).to.revertedWith(
        "WhitelistDistributor: Not allowed to mint."
      );
    });

    it("user can't double-claim", async function () {
      // claim 1st time
      await whitelister.whitelistAccount(user1.address);
      await whitelister.connect(user1).claim();

      // 2nd time reverts
      const tx = whitelister.connect(user1).claim();
      await expect(tx).to.be.revertedWith("WhitelistDistributor: Drop already claimed.");
    });
  });
});
