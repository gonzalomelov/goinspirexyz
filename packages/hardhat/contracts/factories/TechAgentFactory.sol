// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../TechAgent.sol";

contract TechAgentFactory {
    function createTechAgent(address oracleAddress) external returns (address) {
        TechAgent techAgent = new TechAgent(oracleAddress);
        techAgent.addToWhitelist(msg.sender);
        return address(techAgent);
    }
}