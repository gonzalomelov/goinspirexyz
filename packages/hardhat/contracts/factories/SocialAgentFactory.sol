// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../SocialAgent.sol";

contract SocialAgentFactory {
    function createSocialAgent(address oracleAddress) external returns (address) {
        SocialAgent socialAgent = new SocialAgent(oracleAddress);
        socialAgent.addToWhitelist(msg.sender);
        return address(socialAgent);
    }
}