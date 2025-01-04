// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.13;
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
contract CarbonCreditAuction {
    address public immutable carbonCreditNFT;
    address public owner;

    event AuctionCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 indexed startingPrice,
        uint256 endTime
    );
    event AuctionBid(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 indexed amount
    );
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 indexed amount
    );

    struct Auction {
        uint256 tokenId;
        address seller;
        uint256 startingPrice;
        uint256 endTime;
        address highestBidder;
        uint256 highestBid;
    }

    mapping(uint256 => Auction) public auctions;

    constructor(address _carbonCreditNFT) {
        require(_carbonCreditNFT != address(0), "Invalid NFT contract address");
        carbonCreditNFT = _carbonCreditNFT;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function createAuction(
        uint256 tokenId,
        uint256 startingPrice,
        uint256 endTime
    ) external {
        require(
            IERC721(carbonCreditNFT).ownerOf(tokenId) == msg.sender,
            "Not the owner of the token"
        );
        require(startingPrice > 0, "Invalid starting price");
        require(endTime > block.timestamp, "Invalid end time");

        auctions[tokenId] = Auction(tokenId, msg.sender, startingPrice, endTime, address(0), 0);

        emit AuctionCreated(tokenId, msg.sender, startingPrice, endTime);
    }

    function bid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.endTime > block.timestamp, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid too low");

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;

        emit AuctionBid(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) external {
        Auction storage auction = auctions[tokenId];
        require(auction.endTime <= block.timestamp, "Auction has not ended");
        require(auction.highestBid > 0, "No bids");
        IERC721(carbonCreditNFT).safeTransferFrom(
            auction.seller,
            auction.highestBidder,
            tokenId
        );

        payable(auction.seller).transfer(auction.highestBid);

        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);

        delete auctions[tokenId];
    }


    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getAuction(uint256 tokenId) external view returns (Auction memory) {
        return auctions[tokenId];
    }


}