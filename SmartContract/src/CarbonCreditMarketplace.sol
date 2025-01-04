// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CarbonCreditMarketplace {
    address public immutable carbonCreditNFT;
    address public owner;

    event NFTPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    constructor(address _carbonCreditNFT) {
        require(_carbonCreditNFT != address(0), "Invalid NFT contract address");
        carbonCreditNFT = _carbonCreditNFT;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function purchaseToken(uint256 tokenId, uint256 price) external payable {
        require(msg.value >= price, "Insufficient payment");

        address seller = IERC721(carbonCreditNFT).ownerOf(tokenId);
        require(seller != address(0), "Invalid seller");

        payable(seller).transfer(price);

        IERC721(carbonCreditNFT).safeTransferFrom(seller, msg.sender, tokenId);

        emit NFTPurchased(tokenId, msg.sender, seller, price);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}