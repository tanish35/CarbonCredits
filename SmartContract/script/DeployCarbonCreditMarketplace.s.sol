// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditMarketplace.sol";

contract DeployCarbonCreditMarketplace is Script {
    function run() external {
        address carbonCreditNFTAddress = 0xb525D4F4EDB03eb4cAc9b2E5110D136486cE1fdd;
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

//0x63e15493889eCC991A06b64EB82609f4793d724c
