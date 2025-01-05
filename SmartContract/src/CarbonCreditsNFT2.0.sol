// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract CarbonCreditNFT is ERC721URIStorage, Ownable(msg.sender) {
    uint256 public totalSupply;
    uint256 private _tokenId;
    uint256 public defaultRate = 1 ether;

    // Events
    event CreditMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 price,
        string certificateURI,
        uint256 expiryDate
    );
    event CreditTransferred(
        address indexed from,
        address indexed to,
        uint256 tokenId,
        uint256 amount
    );
    event CreditRetired(address indexed owner, uint256 indexed tokenId);
    event RewardIssued(address indexed to, uint256 reward);

    struct Credit {
        uint256 id;
        string typeofcredit;
        uint256 quantity;
        string certificateURI;
        uint256 expiryDate;
        bool retired;
    }

    mapping(address => Credit[]) public credits;
    mapping(uint256 => Credit) public creditId;
    mapping(uint256 => address) public creditOwner;
    mapping(uint256 => uint256) public tokenRates;
    mapping(uint256 => uint256) public tokenMintedAt;

    address[] public authorizedMinters;
    mapping(address => bool) public isMinter;

    uint256 public rewardPointsPerRetirement = 10;
    mapping(address => uint256) public userRewards;

    constructor() ERC721("CarbonCreditsNFT", "CCNFT") {}

    function mint(
        address to,
        string memory typeofcredit,
        uint256 quantity,
        string memory certificateURI,
        uint256 expiryDate,
        uint256 rate
    ) public {
        require(
            isMinter[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        uint256 id = _tokenId;
        Credit memory credit = Credit(
            id,
            typeofcredit,
            quantity,
            certificateURI,
            expiryDate,
            false
        );
        credits[to].push(credit);
        creditId[id] = credit;
        creditOwner[id] = to;
        tokenMintedAt[id] = block.timestamp;
        totalSupply++;
        _tokenId++;

        _mint(to, id);
        _setTokenURI(id, certificateURI);

        tokenRates[id] = rate > 0 ? rate : defaultRate;

        emit CreditMinted(to, id, rate, certificateURI, expiryDate);
    }

    modifier setApproved(uint256 tokenId, address _from) {
        require(
            creditOwner[tokenId] == _from,
            "You are not the owner of this credit"
        );
        _;
    }

    // Override safeTransferFrom to update credits mapping
    // In your CarbonCreditNFT contract
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(IERC721, ERC721) {
        super.safeTransferFrom(from, to, tokenId); // Call the parent ERC721 safeTransferFrom

        // After calling the parent function, update the custom credits mapping
        _removeCredit(from, tokenId);
        _addCredit(to, tokenId);

        creditOwner[tokenId] = to; // Update the credit owner mapping
        emit CreditTransferred(from, to, tokenId, tokenRates[tokenId]);
    }

    function _removeCredit(address owner, uint256 tokenId) internal {
        Credit[] storage userCredits = credits[owner];
        for (uint256 i = 0; i < userCredits.length; i++) {
            if (userCredits[i].id == tokenId) {
                // Remove the credit from the user's credits list
                userCredits[i] = userCredits[userCredits.length - 1];
                userCredits.pop();
                break;
            }
        }
    }

    function _addCredit(address owner, uint256 tokenId) internal {
        Credit memory credit = creditId[tokenId];
        credits[owner].push(credit);
    }

    function retire(uint256 tokenId) public {
        require(
            creditOwner[tokenId] == msg.sender,
            "You are not the owner of this credit"
        );
        require(!creditId[tokenId].retired, "This credit is already retired");

        creditId[tokenId].retired = true;
        totalSupply--;

        _burn(tokenId);

        userRewards[msg.sender] += rewardPointsPerRetirement;
        emit RewardIssued(msg.sender, rewardPointsPerRetirement);

        emit CreditRetired(msg.sender, tokenId);
    }

    function addMinter(address minter) public onlyOwner {
        require(!isMinter[minter], "Already a minter");
        isMinter[minter] = true;
        authorizedMinters.push(minter);
    }

    function removeMinter(address minter) public onlyOwner {
        require(isMinter[minter], "Not a minter");
        isMinter[minter] = false;
    }

    function claimRewards() public {
        uint256 reward = userRewards[msg.sender];
        require(reward > 0, "No rewards available");

        // Token reward distribution to be done here

        userRewards[msg.sender] = 0;
    }

    function voteUpgrade(
        string memory proposal,
        bool approve
    ) public onlyOwner {
        // To be done in the future
    }

    function setRate(uint256 tokenId, uint256 rate) public onlyOwner {
        tokenRates[tokenId] = rate;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getCreditOwner(uint256 tokenId) public view returns (address) {
        return creditOwner[tokenId];
    }

    function getCredit(uint256 tokenId) public view returns (Credit memory) {
        return creditId[tokenId];
    }

    function getCreditByOwner(
        address owner
    ) public view returns (Credit[] memory) {
        return credits[owner];
    }

    function getRate(uint256 tokenId) public view returns (uint256) {
        uint256 baseRate = tokenRates[tokenId];
        uint256 mintedAt = tokenMintedAt[tokenId];
        uint256 timeElapsed = block.timestamp - mintedAt;
        if (timeElapsed > 30 days) {
            baseRate = (baseRate * 90) / 100;
        }
        if (creditId[tokenId].quantity > 100) {
            baseRate += (baseRate * 20) / 100;
        }
        if (block.timestamp + 7 days > creditId[tokenId].expiryDate) {
            baseRate = (baseRate * 80) / 100;
        }
        return baseRate;
    }
}
