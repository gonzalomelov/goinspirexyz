// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./EnhancedAnthropicChatGpt.sol";

contract BaseAgent is EnhancedAnthropicChatGpt {
    constructor(address initialOracleAddress) EnhancedAnthropicChatGpt(initialOracleAddress) {}
}