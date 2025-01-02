// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditsNFT2.0.sol";

contract TransferCarbonCreditNFT is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Create an instance of the CarbonCreditNFT contract
        CarbonCreditNFT carbonCreditNFT = CarbonCreditNFT(0xe2dc0a8D8AAD4A177cE3285c65b71E042987184D);

        // Define the sender, recipient, and tokenId
        address from = 0xB76c4D0BDc1B1508b66A36BE5fdc362Cc79988b3;
        address to = 0xf2eAcB364AD62cA6aaCEcF207aBf93FA7de4E03B;
        uint256 tokenId = 0;

        // Call the safeTransferFrom function to transfer the token
        carbonCreditNFT.safeTransferFrom(from, to, tokenId);

        // Stop broadcasting transactions
        vm.stopBroadcast();
    }
}
