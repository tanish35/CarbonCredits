// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditMarketplace.sol";

contract DeployCarbonCreditMarketplace is Script {
    function run() external {
        address carbonCreditNFTAddress = 0x1A33A6F1A7D001A5767Cd9303831Eb3B9b916AEA;
        vm.startBroadcast();
        CarbonCreditMarketplace marketplace = new CarbonCreditMarketplace(
            carbonCreditNFTAddress
        );

        console.log(
            "CarbonCreditMarketplace deployed at:",
            address(marketplace)
        );

        vm.stopBroadcast();
    }
}

//0x79298aF4e4F51c746dEeE692a40a3141C9b142ef
