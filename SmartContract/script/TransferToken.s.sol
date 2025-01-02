// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditsNFT2.0.sol";

contract TransferCarbonCreditNFT is Script {
    function run() external {
        vm.startBroadcast();

        CarbonCreditNFT carbonCreditNFT = CarbonCreditNFT(0x9CfdAEAff42D4941B8435A97646E80568e525f71);

        address owner = 0x424bBA2a6f1c14e4D8e2Cf1bCAE1B06740Fa4755;
        address operator = 0xB76c4D0BDc1B1508b66A36BE5fdc362Cc79988b3;
        address to = 0xf2eAcB364AD62cA6aaCEcF207aBf93FA7de4E03B;
        address owner1 = carbonCreditNFT.ownerOf(0);
        console.log("Owner:", owner1);

        // Transfer the token from the current owner to the new address
        carbonCreditNFT.safeTransferFrom(owner, to, 0);

        vm.stopBroadcast();
    }
}
