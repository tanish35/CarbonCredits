// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CarbonCreditsNFT2.0.sol";

contract CheckApprovalStatus is Script {
    function run() external {
        vm.startBroadcast();

        CarbonCreditNFT carbonCreditNFT = CarbonCreditNFT(0x9CfdAEAff42D4941B8435A97646E80568e525f71);

        address owner = 0x424bBA2a6f1c14e4D8e2Cf1bCAE1B06740Fa4755;
        address operator = 0xB76c4D0BDc1B1508b66A36BE5fdc362Cc79988b3;

        address tokenOwner = carbonCreditNFT.ownerOf(0);
        address approvedOwner=carbonCreditNFT.getApproved(0);
        console.log("Token approved owner is:", approvedOwner);
        console.log("Token owner is:", tokenOwner);
        carbonCreditNFT.approve(operator, 0);


        vm.stopBroadcast();
    }
}
