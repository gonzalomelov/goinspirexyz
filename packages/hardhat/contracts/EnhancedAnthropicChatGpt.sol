// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";

// @title ChatGpt
// @notice This contract interacts with teeML oracle to handle chat interactions using the Anthropic model.
contract EnhancedAnthropicChatGpt {

    struct Message {
        string role;
        string content;
    }

    struct ChatRun {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    // @notice Mapping from chat ID to ChatRun
    mapping(uint => ChatRun) public chatRuns;
    uint private chatRunsCount;

    // @notice Event emitted when a new chat is created
    event ChatCreated(address indexed owner, uint indexed chatId);

    // @notice Address of the contract owner
    address private owner;
    
    // @notice Address of the oracle contract
    address public oracleAddress;

    // @notice Configuration for the LLM request
    IOracle.LlmRequest private config;
    
    // @notice CID of the knowledge base
    string public knowledgeBase;

    // @notice Mapping from chat ID to the tool currently running
    mapping(uint => string) public toolRunning;

    // @notice Event emitted when the oracle address is updated
    event OracleAddressUpdated(address indexed newOracleAddress);

    // Add these near the top of your contract, after the existing state variables
    mapping(address => bool) public whitelistedAddresses;
    address[] public whitelistedAddressList;

    // Add this modifier
    modifier onlyOwnerOrWhitelisted() {
        require(msg.sender == owner || whitelistedAddresses[msg.sender], "Not authorized");
        _;
    }

    // Add these functions
    function addToWhitelist(address _address) public onlyOwner {
        if (!whitelistedAddresses[_address]) {
            whitelistedAddresses[_address] = true;
            whitelistedAddressList.push(_address);
        }
    }

    function removeFromWhitelist(address _address) public onlyOwner {
        if (whitelistedAddresses[_address]) {
            whitelistedAddresses[_address] = false;
            // Remove from the list
            for (uint i = 0; i < whitelistedAddressList.length; i++) {
                if (whitelistedAddressList[i] == _address) {
                    whitelistedAddressList[i] = whitelistedAddressList[whitelistedAddressList.length - 1];
                    whitelistedAddressList.pop();
                    break;
                }
            }
        }
    }

    function getWhitelistedAddresses() public view returns (address[] memory) {
        return whitelistedAddressList;
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelistedAddresses[_address];
    }

    // @param initialOracleAddress Initial address of the oracle contract
    constructor(address initialOracleAddress) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        chatRunsCount = 0;

        config = IOracle.LlmRequest({
            model : "claude-3-5-sonnet-20240620",
            frequencyPenalty : 21, // > 20 for null
            logitBias : "", // empty str for null
            maxTokens : 1000, // 0 for null
            presencePenalty : 21, // > 20 for null
            responseFormat : "{\"type\":\"text\"}",
            seed : 0, // null
            stop : "", // null
            temperature : 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
            topP : 101, // Percentage 0-100, > 100 means null
            tools : "[{\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"description\":\"Search the internet\",\"parameters\":{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"Search query\"}},\"required\":[\"query\"]}}},{\"type\":\"function\",\"function\":{\"name\":\"code_interpreter\",\"description\":\"Evaluates python code in a sandbox environment. The environment resets on every execution. You must send the whole script every time and print your outputs. Script should be pure python code that can be evaluated. It should be in python format NOT markdown. The code should NOT be wrapped in backticks. All python packages including requests, matplotlib, scipy, numpy, pandas, etc are available. Output can only be read from stdout, and stdin. Do not use things like plot.show() as it will not work. print() any output and results so you can capture the output.\",\"parameters\":{\"type\":\"object\",\"properties\":{\"code\":{\"type\":\"string\",\"description\":\"The pure python script to be evaluated. The contents will be in main.py. It should not be in markdown format.\"}},\"required\":[\"code\"]}}}]",
            toolChoice : "auto", // "none" or "auto"
            user : "" // null
        });
    }

    // @notice Ensures the caller is the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // @notice Ensures the caller is the oracle contract
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    // @notice Sets a new oracle address
    // @param newOracleAddress The new oracle address
    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    // @notice Starts a new chat
    // @param message The initial message to start the chat with
    // @return The ID of the newly created chat
    function startChat(string memory message) public returns (uint) {
        ChatRun storage run = chatRuns[chatRunsCount];

        run.owner = msg.sender;
        Message memory newMessage = Message({
            role: "user",
            content: message
        });
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = chatRunsCount;
        chatRunsCount++;

        IOracle(oracleAddress).createLlmCall(currentId, config);
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    // @notice Handles the response from the oracle for an LLM call
    // @param runId The ID of the chat run
    // @param response The response from the oracle
    // @dev Called by teeML oracle
    function onOracleLlmResponse(
        uint runId,
        IOracle.LlmResponse memory response,
        string memory errorMessage
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            compareStrings(run.messages[run.messagesCount - 1].role, "user"),
            "No message to respond to"
        );

        if (!compareStrings(errorMessage, "")) {
            Message memory newMessage = Message({
                role: "assistant",
                content: errorMessage
            });
            run.messages.push(newMessage);
            run.messagesCount++;
        } else {
            if (!compareStrings(response.functionName, "")) {
                toolRunning[runId] = response.functionName;
                IOracle(oracleAddress).createFunctionCall(runId, response.functionName, response.functionArguments);
            } else {
                toolRunning[runId] = "";
            }
            Message memory newMessage = Message({
                role: "assistant",
                content: response.content
            });
            run.messages.push(newMessage);
            run.messagesCount++;
        }
    }

    // @notice Handles the response from the oracle for a function call
    // @param runId The ID of the chat run
    // @param response The response from the oracle
    // @param errorMessage Any error message
    // @dev Called by teeML oracle
    function onOracleFunctionResponse(
        uint runId,
        string memory response,
        string memory errorMessage
    ) public onlyOracle {
        require(
            !compareStrings(toolRunning[runId], ""),
            "No function to respond to"
        );
        ChatRun storage run = chatRuns[runId];
        if (compareStrings(errorMessage, "")) {
            Message memory newMessage = Message({
                role: "user",
                content: response
            });
            run.messages.push(newMessage);
            run.messagesCount++;
            IOracle(oracleAddress).createLlmCall(runId, config);
        }
    }

    // @notice Handles the response from the oracle for a knowledge base query
    // @param runId The ID of the chat run
    // @param documents The array of retrieved documents
    // @dev Called by teeML oracle
    function onOracleKnowledgeBaseQueryResponse(
        uint runId,
        string[] memory documents,
        string memory /*errorMessage*/
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            compareStrings(run.messages[run.messagesCount - 1].role, "user"),
            "No message to add context to"
        );
        Message storage lastMessage = run.messages[run.messagesCount - 1];

        string memory newContent = lastMessage.content;

        // Append "Relevant context:\n" only if there are documents
        if (documents.length > 0) {
            newContent = string(abi.encodePacked(newContent, "\n\nRelevant context:\n"));
        }

        // Iterate through the documents and append each to the newContent
        for (uint i = 0; i < documents.length; i++) {
            newContent = string(abi.encodePacked(newContent, documents[i], "\n"));
        }

        lastMessage.content = newContent;

        // Call LLM
        IOracle(oracleAddress).createLlmCall(runId, config);
    }

    // @notice Adds a new message to an existing chat run
    // @param message The new message to add
    // @param runId The ID of the chat run
    function addMessage(string memory message, uint runId) public { // onlyOwnerOrWhitelisted
        ChatRun storage run = chatRuns[runId];
        require(
            compareStrings(run.messages[run.messagesCount - 1].role, "assistant"),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only chat owner can add messages"
        );

        Message memory newMessage = Message({
            role: "user",
            content: message
        });
        run.messages.push(newMessage);
        run.messagesCount++;
        // If there is a knowledge base, create a knowledge base query
        if (bytes(knowledgeBase).length > 0) {
            IOracle(oracleAddress).createKnowledgeBaseQuery(
                runId,
                knowledgeBase,
                message,
                3
            );
        } else {
            // Otherwise, create an LLM call
            IOracle(oracleAddress).createLlmCall(runId, config);
        }
    }

    function getMessageHistoryContents(uint chatId) public view returns (string[] memory) {
        ChatRun storage run = chatRuns[chatId];
        string[] memory contents = new string[](run.messagesCount);
        for (uint i = 0; i < run.messagesCount; i++) {
            contents[i] = run.messages[i].content;
        }
        return contents;
    }

    function getMessageHistoryRoles(uint chatId) public view returns (string[] memory) {
        ChatRun storage run = chatRuns[chatId];
        string[] memory roles = new string[](run.messagesCount);
        for (uint i = 0; i < run.messagesCount; i++) {
            roles[i] = run.messages[i].role;
        }
        return roles;
    }

    // @notice Compares two strings for equality
    // @param a The first string
    // @param b The second string
    // @return True if the strings are equal, false otherwise
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
