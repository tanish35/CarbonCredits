// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditsNFT2.0.sol";

contract DeployCarbonCreditNFT is Script {
    function run() external {
        vm.startBroadcast();
        CarbonCreditNFT carbonCreditNFT = new CarbonCreditNFT();
        console.log("CarbonCreditNFT deployed at:", address(carbonCreditNFT));
        vm.stopBroadcast();
    }
}

// Contract Address: 0xe2dc0a8D8AAD4A177cE3285c65b71E042987184D
