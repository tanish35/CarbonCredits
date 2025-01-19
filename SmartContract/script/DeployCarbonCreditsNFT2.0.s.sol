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

// Latest address:0x0d388696b31522Cd45776190783072b10E8e2776
// Contract Address: 0x1A33A6F1A7D001A5767Cd9303831Eb3B9b916AEA
// Mainnet:0x1EDb6017B94438d3b5B3241DEeb816e2a81773b8
