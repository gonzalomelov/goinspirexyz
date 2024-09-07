// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";
import "./interfaces/IOpenAiChatGpt.sol";
import "./factories/TechAgentFactory.sol";
import "./factories/SocialAgentFactory.sol";
import "./factories/DataAgentFactory.sol";

contract LeadAgent {

    string public prompt;

    struct Message {
        string role;
        string content;
    }

    enum Situation {
        UsdcDonation,
        NftMint
    }

    struct AgentRun {
        address owner;
        address creator;
        address target;
        string targetFirstName;
        string targetFriend;
        Situation situation;
        string publicInfo;
        string privateInfo;
        string groupTitle;
        string groupImage;
        string groupId;
        Message[] commands;
        uint responsesCount;
        uint8 max_iterations;
        bool is_finished;
    }

    struct AgentRunInfo {
        address owner;
        address creator;
        address target;
        string targetFirstName;
        string targetFriend;
        Situation situation;
        string publicInfo;
        string privateInfo;
        string groupTitle;
        string groupImage;
        string groupId;
        uint responsesCount;
        uint8 max_iterations;
        bool is_finished;
    }

    mapping(uint => AgentRun) public agentRuns;
    uint public agentRunCount;

    event AgentRunCreated(address indexed owner, uint indexed runId);

    address private owner;
    address public oracleAddress;

    event OracleAddressUpdated(address indexed newOracleAddress);

    IOracle.OpenAiRequest private config;

    IOpenAiChatGpt public techAgent;
    IOpenAiChatGpt public socialAgent;
    IOpenAiChatGpt public dataAgent;

    constructor(
        address initialOracleAddress,         
        string memory systemPrompt,
        address techAgentFactoryAddress,
        address socialAgentFactoryAddress,
        address dataAgentFactoryAddress
    ) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        prompt = systemPrompt;

        // Deploy sub-agents using factories
        techAgent = IOpenAiChatGpt(TechAgentFactory(techAgentFactoryAddress).createTechAgent(oracleAddress));
        socialAgent = IOpenAiChatGpt(SocialAgentFactory(socialAgentFactoryAddress).createSocialAgent(oracleAddress));
        dataAgent = IOpenAiChatGpt(DataAgentFactory(dataAgentFactoryAddress).createDataAgent(oracleAddress));

        config = IOracle.OpenAiRequest({
            model : "gpt-4-turbo-preview",
            frequencyPenalty : 21, // > 20 for null
            logitBias : "", // empty str for null
            maxTokens : 1000, // 0 for null
            presencePenalty : 21, // > 20 for null
            responseFormat : "{\"type\":\"text\"}",
            seed : 0, // null
            stop : "", // null
            temperature : 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
            topP : 101, // Percentage 0-100, > 100 means null
            tools : "[{\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"description\":\"Search the internet\",\"parameters\":{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"Search query\"}},\"required\":[\"query\"]}}},{\"type\":\"function\",\"function\":{\"name\":\"image_generation\",\"description\":\"Generates an image using Dalle-2\",\"parameters\":{\"type\":\"object\",\"properties\":{\"prompt\":{\"type\":\"string\",\"description\":\"Dalle-2 prompt to generate an image\"}},\"required\":[\"prompt\"]}}}]",
            toolChoice : "auto", // "none" or "auto"
            user : "" // null
        });
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    function setOracleAddress(address newOracleAddress) public onlyOwner {
        require(msg.sender == owner, "Caller is not the owner");
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function runAgent(
        string memory query,
        uint8 max_iterations,
        string memory techAgentPrompt,
        string memory socialAgentPrompt,
        string memory dataAgentPrompt,
        address creator,
        address target,
        string memory targetFirstName,
        string memory targetFriend,
        Situation situation,
        string memory publicInfo,
        string memory privateInfo,
        string memory groupTitle,
        string memory groupImage,
        string memory groupId
    ) public returns (uint) {
        uint currentId = agentRunCount;
        AgentRun storage run = agentRuns[currentId];

        run.owner = msg.sender;
        run.creator = creator;
        run.target = target;
        run.targetFirstName = targetFirstName;
        run.targetFriend = targetFriend;
        run.situation = situation;
        run.publicInfo = publicInfo;
        run.privateInfo = privateInfo;
        run.groupTitle = groupTitle;
        run.groupImage = groupImage;
        run.groupId = groupId;
        run.is_finished = false;
        run.responsesCount = 0;
        run.max_iterations = max_iterations;

        // Initialize sub-agents with prompts
        techAgent.startChat(techAgentPrompt);
        socialAgent.startChat(socialAgentPrompt);
        dataAgent.startChat(dataAgentPrompt);

        Message memory systemMessage;
        systemMessage.content = prompt;
        systemMessage.role = "system";
        run.commands.push(systemMessage);

        Message memory newMessage;
        newMessage.content = query;
        newMessage.role = "user";
        run.commands.push(newMessage);

        agentRunCount = agentRunCount + 1;

        IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
        emit AgentRunCreated(run.owner, currentId);

        return currentId;
    }

    function onOracleOpenAiLlmResponse(
        uint runId,
        IOracle.OpenAiResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        AgentRun storage run = agentRuns[runId];

        // If there is an error message, add it to the commands and mark the run as finished
        if (!compareStrings(errorMessage, "")) {
            Message memory newMessage;
            newMessage.role = "assistant";
            newMessage.content = errorMessage;
            run.commands.push(newMessage);
            run.responsesCount++;
            run.is_finished = true;
            return;
        }

        // If there is a response content, add it to the commands
        if (!compareStrings(response.content, "")) {
            Message memory assistantMessage;
            assistantMessage.content = response.content;
            assistantMessage.role = "assistant";
            run.commands.push(assistantMessage);
            run.responsesCount++;

            if (startsWith(response.content, "TechAgent do:")) {
                techAgent.addMessage(response.content, runId);
            } else if (startsWith(response.content, "SocialAgent do:")) {
                socialAgent.addMessage(response.content, runId);
            } else if (startsWith(response.content, "DataAgent do:")) {
                dataAgent.addMessage(response.content, runId);
            }
        }

        // If there is a function name in the response, initiate a function call
        if (!compareStrings(response.functionName, "")) {
            IOracle(oracleAddress).createFunctionCall(runId, response.functionName, response.functionArguments);
            return;
        }

        // If the maximum number of iterations is reached, mark the run as finished
        if (run.responsesCount >= run.max_iterations) {
            run.is_finished = true;
            return;
        }

        // Do not call createOpenAiLlmCall here, wait for user input
    }

    function onOracleFunctionResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        AgentRun storage run = agentRuns[runId];
        require(
            !run.is_finished, "Run is finished"
        );
        string memory result = response;
        if (!compareStrings(errorMessage, "")) {
            result = errorMessage;
        }
        Message memory newMessage;
        newMessage.role = "user";
        newMessage.content = result;
        run.commands.push(newMessage);
        run.responsesCount++;
        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }

    function getMessageHistoryContents(uint agentId) public view returns (string[] memory) {
        string[] memory commands = new string[](agentRuns[agentId].commands.length);
        for (uint i = 0; i < agentRuns[agentId].commands.length; i++) {
            commands[i] = agentRuns[agentId].commands[i].content;
        }
        return commands;
    }

    function getMessageHistoryRoles(uint agentId) public view returns (string[] memory) {
        string[] memory roles = new string[](agentRuns[agentId].commands.length);
        for (uint i = 0; i < agentRuns[agentId].commands.length; i++) {
            roles[i] = agentRuns[agentId].commands[i].role;
        }
        return roles;
    }

    function isRunFinished(uint runId) public view returns (bool) {
        return agentRuns[runId].is_finished;
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // Add helper functions
    function startsWith(string memory str, string memory prefix) private pure returns (bool) {
        return keccak256(abi.encodePacked(substring(str, 0, bytes(prefix).length))) == keccak256(abi.encodePacked(prefix));
    }

    function substring(string memory str, uint startIndex, uint endIndex) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    // @notice Adds a new message to an existing agent run
    // @param message The new message to add
    // @param runId The ID of the agent run
    function addMessage(string memory message, uint runId) public {
        AgentRun storage run = agentRuns[runId];
        require(!run.is_finished, "Run is finished");
        require(run.owner == msg.sender, "Only run owner can add commands");

        Message memory newMessage;
        newMessage.role = "user";
        newMessage.content = message;
        run.commands.push(newMessage);
        run.responsesCount++;

        // Continue the agent run by making another OpenAI LLM call
        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }

    function getAgentRuns(address _creator) public view returns (AgentRunInfo[] memory) {
        uint count = 0;
        for (uint i = 0; i < agentRunCount; i++) {
            if (_creator == address(0) || agentRuns[i].creator == _creator) {
                count++;
            }
        }

        AgentRunInfo[] memory filteredRuns = new AgentRunInfo[](count);
        uint index = 0;
        for (uint i = 0; i < agentRunCount; i++) {
            if (_creator == address(0) || agentRuns[i].creator == _creator) {
                filteredRuns[index] = AgentRunInfo({
                    owner: agentRuns[i].owner,
                    creator: agentRuns[i].creator,
                    target: agentRuns[i].target,
                    targetFirstName: agentRuns[i].targetFirstName,
                    targetFriend: agentRuns[i].targetFriend,
                    situation: agentRuns[i].situation,
                    publicInfo: agentRuns[i].publicInfo,
                    privateInfo: agentRuns[i].privateInfo,
                    groupTitle: agentRuns[i].groupTitle,
                    groupImage: agentRuns[i].groupImage,
                    groupId: agentRuns[i].groupId,
                    responsesCount: agentRuns[i].responsesCount,
                    max_iterations: agentRuns[i].max_iterations,
                    is_finished: agentRuns[i].is_finished
                });
                index++;
            }
        }

        return filteredRuns;
    }
}
