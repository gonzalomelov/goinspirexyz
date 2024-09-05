// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../DataAgent.sol";

contract DataAgentFactory {
    function createDataAgent(address oracleAddress) external returns (address) {
        DataAgent dataAgent = new DataAgent(oracleAddress);
        dataAgent.addToWhitelist(msg.sender);
        return address(dataAgent);
    }
}