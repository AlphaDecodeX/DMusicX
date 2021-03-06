// SPDX-License-Identifier:MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MusicNFTMarketplace is ERC721("DMusic", "DAPP"), Ownable {
    string public baseURI = "https://bafybeibxtnzboo4gsjqmhv7tbjyulnxuznvz5xcmqxu5a5c3eksdblbgse.ipfs.nftstorage.link/";
    string public baseExtension = ".json";
    address public artist;
    uint256 public royaltyFee;

    struct MarketItem{
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }
    MarketItem[] public marketItems;
    
    event MarketItemBought(
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price
    );

    constructor(uint256 _royaltyFee, address _artist, uint256[] memory _prices) payable{
        require(_prices.length*_royaltyFee <= msg.value, 
        "Deployer must pay royalty fee for each token listed on the marketplace");
        royaltyFee = _royaltyFee;
        artist = _artist;
        for(uint8 i = 0; i<_prices.length;i++){
            require(_prices[i]>0, "Price must be greater than 0");
            _mint(address(this), i);
            marketItems.push(MarketItem(i, payable(msg.sender), _prices[i]));
        }
    }
    function updateRoyaltyFee(uint256 _royalFee) external onlyOwner {
        royaltyFee = _royalFee;
    }
    function buyToken(uint256 _tokenId) external payable{
        uint256 price = marketItems[_tokenId].price;
        address seller = marketItems[_tokenId].seller;
        require(msg.value == price, "Please send the asking price in order to complete the purchase");
        marketItems[_tokenId].seller = payable(address(0));
        _transfer(address(this), msg.sender, _tokenId);
        payable(artist).transfer(royaltyFee);
        payable(seller).transfer(msg.value);
        emit MarketItemBought(_tokenId, seller, msg.sender, price);
    }
}