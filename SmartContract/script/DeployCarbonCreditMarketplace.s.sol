// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditMarketplace.sol";

contract DeployCarbonCreditMarketplace is Script {
    function run() external {
        address carbonCreditNFTAddress = 0x9CfdAEAff42D4941B8435A97646E80568e525f71;
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
