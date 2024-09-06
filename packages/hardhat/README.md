# Smart Contracts Overview

This README provides an overview of the smart contracts used in the project, which implements an AI-powered agent system on the Ethereum blockchain.

## Interaction

```mermaid
sequenceDiagram
    participant User
    participant LeadAgent
    %% participant TechAgent
    participant SocialAgent
    %% participant DataAgent
    participant Oracle

    User->>LeadAgent: runAgent <br> ('You're a lead agent...', 5)
    LeadAgent->>Oracle: createOpenAiLlmCall <br> ('You're a lead agent...')
    Oracle-->>LeadAgent: onOracleOpenAiLlmResponse(): 'OK'
    User->>LeadAgent: sendMessage <br> ('Jack: Hey Bob, how are you?')
    LeadAgent->>Oracle: createOpenAiLlmCall() <br> ('Jack: Hey Bob, how are you?')
    Oracle-->>LeadAgent: onOracleOpenAiLlmResponse(): <br> 'SocialAgent do: "Say hello to Bob"'
    
    alt SocialAgent responds
        LeadAgent->>SocialAgent: sendMessage <br> ('Say hello to Bob')
        SocialAgent->>Oracle: createOpenAiLlmCall() <br> ('Say hello to Bob')
        Oracle-->>SocialAgent: onOracleOpenAiLlmResponse(): <br> 'Hello Bob! How are you doing?'
        SocialAgent-->>LeadAgent: OK
    else TechAgent responds
        LeadAgent->>TechAgent: sendMessage()
        TechAgent->>Oracle: createOpenAiLlmCall() <br> ('...')
        Oracle-->>TechAgent: onOracleOpenAiLlmResponse(): 'OK'
        TechAgent-->>LeadAgent: OK
    else DataAgent responds
        LeadAgent->>DataAgent: sendMessage()
        DataAgent->>Oracle: createOpenAiLlmCall() <br> ('...')
        Oracle-->>DataAgent: onOracleOpenAiLlmResponse(): 'OK'
        DataAgent-->>LeadAgent: OK
    end
```

## Core Contracts

### LeadAgent

The `LeadAgent` contract is the central component of the system, managing agent runs and coordinating interactions between specialized agents.

**Key features:**

- Manages agent runs with multiple iterations
- Interacts with `TechAgent`, `SocialAgent`, and `DataAgent`
- Handles responses from the oracle for LLM calls and function calls
- Allows users to start new agent runs and add messages to existing runs

### EnhancedAnthropicChatGpt

This contract implements a chat interface using the Anthropic AI model, designed to handle chat interactions and function calls through an oracle.

**Key features:**

- Manages chat runs with message history
- Interacts with the oracle for LLM calls and function calls
- Supports a knowledge base query system
- Implements a whitelist system for access control

### EnhancedOpenAiChatGpt

Similar to the Anthropic version, this contract implements a chat interface using the OpenAI model.

**Key features:**

- Manages chat runs with message history
- Interacts with the oracle for OpenAI LLM calls and function calls
- Implements a whitelist system for access control

## Specialized Agent Contracts

### TechAgent, SocialAgent, DataAgent

These contracts extend the `BaseAgent` contract, which in turn extends the `EnhancedAnthropicChatGpt` contract. They are specialized versions of the chat agent for different domains.

## Factory Contracts

### TechAgentFactory, SocialAgentFactory, DataAgentFactory

These factory contracts are responsible for creating instances of the specialized agent contracts.

## Interfaces

The project includes several interface contracts (`IChatGpt`, `IOracle`, `IOpenAiChatGpt`) that define the structure for interactions between the main contracts and the oracle service.

## Usage

To use these contracts:

1. Deploy the factory contracts (`TechAgentFactory`, `SocialAgentFactory`, `DataAgentFactory`).
2. Deploy the `LeadAgent` contract, passing the addresses of the factory contracts and the oracle.
3. Interact with the `LeadAgent` contract to start new agent runs and manage interactions.

**Note:** These contracts rely heavily on an external oracle service for AI model interactions. Ensure that the oracle is properly set up and accessible before deploying and using these contracts.

## Security Considerations

- The contracts implement access control mechanisms, including owner-only functions and whitelisting.
- Ensure that the oracle address is set correctly and that only trusted addresses are whitelisted.
- Review and audit the contracts thoroughl
