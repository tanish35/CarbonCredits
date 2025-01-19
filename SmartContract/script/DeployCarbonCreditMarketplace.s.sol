// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditMarketplace.sol";

contract DeployCarbonCreditMarketplace is Script {
    function run() external {
        address carbonCreditNFTAddress = 0x0d388696b31522Cd45776190783072b10E8e2776;
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
//Mainnet:0x26C8f4b6aBE0D555A341754f890A4c6F4d48cc98
//Latest: 0x276F9bEAa4E3aAC344613468cff5Cf6B5210161B
