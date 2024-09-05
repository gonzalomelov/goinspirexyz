// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface IOpenAiChatGpt {
    function addMessage(string memory message, uint runId) external;
    function startChat(string memory message) external returns (uint);
}