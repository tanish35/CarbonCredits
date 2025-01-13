// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditMarketplace.sol";

contract DeployCarbonCreditMarketplace is Script {
    function run() external {
        address carbonCreditNFTAddress = 0x4Da29dF81dE088587Ce162B57A86692f7BB37374;
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
