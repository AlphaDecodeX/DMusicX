const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (um) => ethers.utils.formatEther(num);
// 1 ether = 10^18 Wei
describe("MusicNFTMarketplace", function () {
  let nftMarketplace;
  let deployer, artist, user1, user2, users;
  let royaltyFee = toWei(0.01);
  let URI =
    "https://bafybeibxtnzboo4gsjqmhv7tbjyulnxuznvz5xcmqxu5a5c3eksdblbgse.ipfs.nftstorage.link/";
  let prices = [
    toWei(1),
    toWei(2),
    toWei(3),
    toWei(4),
    toWei(5),
    toWei(6),
    toWei(7),
    toWei(8),
  ];
  let deploymentFee = toWei(prices.length * 0.01);
  beforeEach(async function () {
    const NFTMarketplaceFactory = await ethers.getContractFactory(
      "MusicNFTMarketplace"
    );
    [deployer, artist, user1, user2, ...users] = await ethers.getSigners();

    nftMarketplace = await NFTMarketplaceFactory.deploy(
      royaltyFee,
      artist.address,
      prices,
      { value: deploymentFee }
    );
  });

  describe("Deployment", function () {
    it("Should track name, symbol, royalty Fee, artist and URI", async function () {
      const nftName = "DMusic";
      const nftSymbol = "DAPP";
      expect(await nftMarketplace.name()).to.equal(nftName);
      expect(await nftMarketplace.symbol()).to.equal(nftSymbol);
      expect(await nftMarketplace.baseURI()).to.equal(URI);
      expect(await nftMarketplace.royaltyFee()).to.equal(royaltyFee);
      expect(await nftMarketplace.artist()).to.equal(artist.address);
    });
    it("Should mint then list all the music nfts", async function () {
      expect(await nftMarketplace.balanceOf(nftMarketplace.address)).to.equal(
        8
      );
      await Promise.all(
        prices.map(async (i, indx) => {
          const item = await nftMarketplace.marketItems(indx);
          expect(item.tokenId).to.equal(indx);
          expect(item.seller).to.equal(deployer.address);
          expect(item.price).to.equal(i);
        })
      );
    });
    it("Ether balance should be equal to the deployment fee", async function () {
      expect(await ethers.provider.getBalance(nftMarketplace.address)).to.equal(
        deploymentFee
      );
    });
  });
});
