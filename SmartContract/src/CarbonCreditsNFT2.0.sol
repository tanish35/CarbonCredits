// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
    event ApprovalForToken(
        address indexed owner,
        address indexed operator,
        uint256 indexed tokenId,
        bool approved
    );

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
    mapping(uint256 => address) private tokenApprovals;

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

    function setApprovalForToken(
        address operator,
        bool approved,
        uint256 tokenId
    ) external {
        require(operator != msg.sender, "Cannot set approval for self");
        require(
            creditOwner[tokenId] == msg.sender,
            "Caller must be the owner of the token"
        );

        if (approved) {
            tokenApprovals[tokenId] = operator;
        } else {
            delete tokenApprovals[tokenId];
        }

        emit ApprovalForToken(msg.sender, operator, tokenId, approved);
    }

    function isApprovedForToken(
        address operator,
        uint256 tokenId
    ) public view returns (bool) {
        return tokenApprovals[tokenId] == operator;
    }

    function transferCredit(
        address from,
        address to,
        uint256 tokenId
    ) public payable {
        require(
            creditOwner[tokenId] == from,
            "You are not the owner of this credit"
        );
        require(
            creditOwner[tokenId] != to,
            "You are already the owner of this credit"
        );
        require(
            creditId[tokenId].expiryDate > block.timestamp,
            "Credit has expired"
        );
        require(creditId[tokenId].retired == false, "Credit has been retired");
        require(msg.value == tokenRates[tokenId], "Insufficient funds");

        payable(from).transfer(msg.value);
        _transfer(from, to, tokenId);

        creditOwner[tokenId] = to;
        emit CreditTransferred(from, to, tokenId, msg.value);
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
        // To done in future
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
        return tokenRates[tokenId];
    }
}

//Written by Somnath 😋😋
