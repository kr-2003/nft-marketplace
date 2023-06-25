/* eslint-disable jest/valid-expect */
/* eslint-disable no-undef */
const { expect } = require("chai");

describe("NFTMarketplace", function () {
  let deployer,
    addr1,
    addr2,
    nft,
    marketplace,
    feePercent = 1;
  beforeEach(async function () {
    const NFT = await ethers.getContractFactory("NFT");
    const Marketplace = await ethers.getContractFactory("Marketplace");

    //Get Signers
    [deployer, addr1, addr2] = await ethers.getSigners();

    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });
  describe("Deployment", function () {
    it("Should track name and symbol of the nft collection", async () => {
      expect(await nft.name()).to.equal("DApp NFT");
      expect(await nft.symbol()).to.equal("DAPP");
    });
    it("Should track feeAccount and feePercent of the marketplace", async () => {
      expect(await marketplace.feeAccount()).to.equal(deployer.address);
      expect(await marketplace.feePercent()).to.equal(feePercent);
    });
  });

  describe("Minting NFTs", function () {
    it("Should track each minted NFT", async function () {
      await nft.connect(addr1).mint(URI);
      expect(await nft.tokenCount()).to.equal(1);
      expect(await nft.balanceOf(addr1.address)).to.equal(1);
      expect(await nft.tokenURI()).to.equal(URI);

      await nft.connect(addr2).mint(URI);
      expect(await nft.tokenCount()).to.equal(2);
      expect(await nft.balanceOf(addr2.address)).to.equal(1);
      expect(await nft.tokenURI()).to.equal(URI);
    });
  });
  
});
