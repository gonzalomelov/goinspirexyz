// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./EnhancedOpenAiChatGpt.sol";

contract BaseAgent is EnhancedOpenAiChatGpt {
    constructor(address initialOracleAddress) EnhancedOpenAiChatGpt(initialOracleAddress) {}
}