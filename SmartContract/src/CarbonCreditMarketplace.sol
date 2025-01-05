// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./CarbonCreditsNFT2.0.sol";

contract CarbonCreditMarketplace is AutomationCompatible {
    address public immutable carbonCreditNFT;
    address public owner;

    struct Auction {
        uint256 tokenId;
        uint256 basePrice;
        uint256 currentPrice;
        address currentBidder;
        uint256 endTime;
        bool active;
    }

    mapping(uint256 => Auction) public auctions;

    event NFTPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event AuctionCreated(
        uint256 indexed tokenId,
        address indexed createrId,
        uint256 basePrice,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 price
    );
    event AuctionOutBid(
        uint256 indexed tokenId,
        address indexed outBidder,
        uint256 indexed amount
    );
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed auctionStarter,
        address indexed winner,
        uint256 price
    );
    event AuctionCancelled(
        uint256 indexed tokenId,
        address indexed auctionStarter,
        address indexed lastBidder
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

        // Fetch credit details from the NFT contract
        CarbonCreditNFT.Credit memory credit = CarbonCreditNFT(carbonCreditNFT)
            .getCredit(tokenId);
        require(block.timestamp <= credit.expiryDate, "Token expired");

        address seller = IERC721(carbonCreditNFT).ownerOf(tokenId);
        require(seller != address(0), "Invalid seller");

        payable(seller).transfer(price);

        IERC721(carbonCreditNFT).safeTransferFrom(seller, msg.sender, tokenId);

        emit NFTPurchased(tokenId, msg.sender, seller, price);
    }

    function createAuction(
        uint256 tokenId,
        uint256 basePrice,
        uint256 duration
    ) external {
        require(
            IERC721(carbonCreditNFT).ownerOf(tokenId) == msg.sender,
            "Not the owner of the token"
        );
        require(duration > 0, "Duration must be greater than zero");

        auctions[tokenId] = Auction({
            tokenId: tokenId,
            basePrice: basePrice,
            currentPrice: basePrice,
            currentBidder: address(0),
            endTime: block.timestamp + duration,
            active: true
        });

        emit AuctionCreated(tokenId,msg.sender, basePrice, block.timestamp + duration);
    }

    function placeBid(uint256 tokenId) external payable {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(
            msg.value > auction.currentPrice,
            "Bid must be higher than current price"
        );

        // Refund the previous bidder
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentPrice);
        }

        auction.currentPrice = msg.value;
        auction.currentBidder = msg.sender;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) internal {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");

        auction.active = false;

        if (auction.currentBidder != address(0)) {
            address seller = IERC721(carbonCreditNFT).ownerOf(tokenId);
            payable(seller).transfer(auction.currentPrice);

            IERC721(carbonCreditNFT).safeTransferFrom(
                seller,
                auction.currentBidder,
                tokenId
            );

            emit AuctionEnded(
                tokenId,
                seller,
                auction.currentBidder,
                auction.currentPrice
            );
        }
    }

    function cancelAuction(uint256 tokenId) external payable{
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(msg.sender == IERC721(carbonCreditNFT).ownerOf(tokenId), "Not the owner of the token");
        auction.active = false;
        if (auction.currentBidder != address(0)) {
            payable(auction.currentBidder).transfer(auction.currentPrice);
        }

        emit AuctionCancelled(tokenId, msg.sender, auction.currentBidder);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Chainlink Automation Functions
    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        for (uint256 tokenId = 0; tokenId < 10000; tokenId++) {
            Auction storage auction = auctions[tokenId];
            if (auction.active && block.timestamp >= auction.endTime) {
                upkeepNeeded = true;
                performData = abi.encode(tokenId);
                return (upkeepNeeded, performData);
            }
        }
        upkeepNeeded = false;
        performData = "";
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        Auction storage auction = auctions[tokenId];
        if (auction.active && block.timestamp >= auction.endTime) {
            endAuction(tokenId);
        }
    }
}
