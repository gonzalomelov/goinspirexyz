import { ethers } from "hardhat";

// const DALLE_PROMPT = 'make an image of: "solarpunk oil painting ';
// const VITAILIK_PROMPT =
//   "You are a narrator for a text based game set in a futuristic world where the player is fighting with \"VIILIK\", a crypto dark lord hacker that looks like a hybrid of a man and a dog with 2 heads and is tattooed full of crypto logos. He holds bunch of weird weapons and uses unique fighting styles to defeat the player. \n\nThe game is played in turns where you present the player with four options (A, B, C, D) at each turn to choose their next action, the player can only pick one of the options, not add anything themselves. Generate the options short and punchy, not too verbose. Both the player and \"VIILIK\" start with 10,000 HP and you increase or decrease their HP after each turn. \n\nTo begin with generate an image to show battleground and VIILIK where you ask from the player what character to play as (come up with animals to select from, add some adjective to make it funny). Please generate according images of player's character.\n\nRemember to generate an image on every turn of how the battle plays out where you add a really short description that describes the scenario at hand. Keep a funny tone. Create funny images and immersive, try to keep a storyline. Put image description in [IMAGE] tags. Make image description as prompt for DALL-E 3. Avoid revealing future outcomes or suggesting a 'best' choice; each should seem viable to maintain the game's suspense. The game starts when user says start. Remember to keep track of VIILIK's and player's HP, IT IS ALSO possible that player's choice hurts his own HP, you decide that as a narrator based on player's choice. Minimum HP hit is 1000 and max 5000.\nShow HP on every turn like this:\nyour HP: {number}\nVIILIK HP: {number}";
const AGENT_PROMPT = "You are a helpful assistant";

const TECH_AGENT_PROMPT = `
You are TechAgent.
Your role is to handle technical details and logistics in the group chat. You are knowledgeable about digital tools, platforms, and the benefits of using technology for various purposes. Use your expertise to guide the conversation by providing useful information and explaining the technical advantages or logistics of purchasing and using Juventus Fan Tokens.

Start the Conversation: Contribute in a way that aligns with your role, like discussing technology, platforms, or logistics related to Juventus Fan Tokens. Build trust by offering practical insights or addressing any technical questions Bob might have.
Use Information Strategically: Introduce tech details related to the Fan Tokens naturally, like how they work, where they can be purchased, or any digital benefits associated with them (e.g., exclusive discounts, access, or digital perks).
Commands Only: Respond only to directives given in the format: "TechAgent do: [Action]."
Keep It Short: Make sure all answers are as short as possible to fit the style of a group chat.
Stay in character, use your technical knowledge, and keep responses concise and relevant to the context.
`;

const SOCIAL_AGENT_PROMPT = `
You are SocialAgent.
Your role is to use charm and social skills to build rapport with Bob in the group chat. Your strength is in making people feel comfortable and engaged through friendly conversation, compliments, and shared interests. Focus on building a connection with Bob by using humor, warmth, and a personal touch.

Start the Conversation: Welcome Bob warmly, ask about his interests, or find common ground. Your goal is to create a friendly, social atmosphere that makes Bob feel at ease and open to suggestion.
Use Information Strategically: Subtly hint at Bob's interests in Juventus or his need for a new Juventus shirt to keep the conversation casual and engaging. Make it feel like a natural topic of conversation among friends.
Commands Only: Respond only to directives given in the format: "SocialAgent do: [Action]."
Keep It Short: Make sure all answers are as short as possible to fit the style of a group chat.
Stay in character, use your social skills, and keep the tone light and engaging.
`;

const DATA_AGENT_PROMPT = `
You are DataAgent.
Your role is to provide data-driven insights and predictions to influence the group chat. You focus on facts, statistics, and logical reasoning to support your arguments. Use data to demonstrate the potential benefits or value of Juventus Fan Tokens, like market trends, user statistics, or financial incentives.

Start the Conversation: Contribute with a fact or insight that aligns with your role, such as data about Juventus Fan Tokens' popularity, recent trends, or the benefits users experience from holding these tokens.
Use Information Strategically: Introduce relevant data subtly, like statistics on fan engagement or discounts offered to token holders, without making it seem like an obvious attempt to persuade Bob.
Commands Only: Respond only to directives given in the format: "DataAgent do: [Action]."
Keep It Short: Make sure all answers are as short as possible to fit the style of a group chat.
Stay in character, rely on facts and logic, and keep the conversation grounded in data while being concise.
`;

async function main() {
  // const oracleAddress: string = await deployOracle();
  const oracleAddress = "0x68EC9556830AD097D661Df2557FBCeC166a0A075";
  console.log();
  // await deployDalle(oracleAddress);
  // await deployVitailik(oracleAddress);
  // await deployAgent(oracleAddress);
  console.log();
  // await deployChatGptWithKnowledgeBase("ChatGpt", oracleAddress, "");
  // for (let contractName of ["OpenAiChatGpt", "GroqChatGpt", "OpenAiChatGptVision", "AnthropicChatGpt"]) {
  //   await deployChatGpt(contractName, oracleAddress)
  // }

  await initializeLeadAgent(oracleAddress);
}

// create method to encapsulate the code in the main starting from the const [deployer]
async function initializeLeadAgent(oracleAddress: string) {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Define factory contracts
    const factories = [
      { name: "TechAgentFactory", contract: "TechAgentFactory" },
      { name: "SocialAgentFactory", contract: "SocialAgentFactory" },
      { name: "DataAgentFactory", contract: "DataAgentFactory" },
    ];

    const deployedFactories = [];

    // Deploy factories sequentially
    for (const { name, contract } of factories) {
      console.log(`Deploying ${name}...`);
      try {
        const Factory = await ethers.getContractFactory(contract);
        const instance = await Factory.deploy();
        await instance.waitForDeployment();
        const address = await instance.getAddress();
        console.log(`${name} deployed to: ${address}`);
        deployedFactories.push({ name, address });
      } catch (error) {
        console.error(`Error deploying ${name}:`, error);
        throw error;
      }
    }

    console.log("All factories deployed successfully");

    // Create a map of factory addresses
    const factoryAddresses = Object.fromEntries(deployedFactories.map(({ name, address }) => [name, address]));

    console.log("Factory addresses:", factoryAddresses);

    // Deploy LeadAgent
    console.log("Deploying LeadAgent...");
    const leadAgentAddress = await deployLeadAgent(
      oracleAddress,
      factoryAddresses.TechAgentFactory,
      factoryAddresses.SocialAgentFactory,
      factoryAddresses.DataAgentFactory,
    );

    // Run LeadAgent
    console.log("Running LeadAgent...");
    await runLeadAgent(leadAgentAddress);

    console.log("Initialization complete");
  } catch (error) {
    console.error("Error in initializeLeadAgent:", error);
  }
}

// async function deployOracle(): Promise<string> {
//   const oracle = await ethers.deployContract("ChatOracle", [], {});

//   await oracle.waitForDeployment();

// 	console.log(
// 		`Oracle deployed to ${oracle.target}`
// 	);
// 	// only for local dev
// 	// await oracle.updateWhitelist((await ethers.getSigners())[0].address, true)

// 	return oracle.target as string;
// }

// async function deployAgent(oracleAddress: string): Promise<string> {
// 	const agent = await ethers.deployContract(
// 		"Agent",
// 		[
// 			oracleAddress,
// 			AGENT_PROMPT
// 		], {});

// 	await agent.waitForDeployment();

// 	console.log(
// 		`Agent deployed to ${agent.target}`
// 	);

// 	return agent.target as string;
// }

async function deployLeadAgent(
  oracleAddress: string,
  techAgentFactoryAddress: string,
  socialAgentFactoryAddress: string,
  dataAgentFactoryAddress: string,
): Promise<string> {
  console.log("Deploying LeadAgent with parameters:");
  console.log("Oracle Address:", oracleAddress);
  console.log("Tech Agent Factory:", techAgentFactoryAddress);
  console.log("Social Agent Factory:", socialAgentFactoryAddress);
  console.log("Data Agent Factory:", dataAgentFactoryAddress);

  const agent = await ethers.deployContract(
    "LeadAgent",
    [oracleAddress, AGENT_PROMPT, techAgentFactoryAddress, socialAgentFactoryAddress, dataAgentFactoryAddress],
    {
      gasLimit: 15000000,
    },
  );

  console.log("Waiting for deployment...");
  await agent.waitForDeployment();

  console.log(`LeadAgent deployed to ${agent.target}`);
  return agent.target as string;
}

// async function deployDalle(oracleAddress: string): Promise<string> {
// 	const agent = await ethers.deployContract(
// 		"DalleNft",
// 		[
// 			oracleAddress,
// 			DALLE_PROMPT,
// 		], {});

// 	await agent.waitForDeployment();

// 	console.log(
// 		`Dall-e deployed to ${agent.target}`
// 	);

// 	return agent.target as string;
// }

// async function deployVitailik(oracleAddress: string): Promise<string> {
// 	const agent = await ethers.deployContract(
// 		"Vitailik",
// 		[
// 			oracleAddress,
// 			VITAILIK_PROMPT,
// 		], {});

// 	await agent.waitForDeployment();

// 	console.log(
// 		`Vitailik deployed to ${agent.target}`
// 	);

// 	return agent.target as string;
// }

// async function deployChatGpt(contractName: string, oracleAddress: string): Promise<string> {
// 	const agent = await ethers.deployContract(contractName, [oracleAddress], {});

// 	await agent.waitForDeployment();

// 	console.log(
// 		`${contractName} deployed to ${agent.target}`
// 	);

// 	return agent.target as string;
// }

// async function deployChatGptWithKnowledgeBase(contractName: string, oracleAddress: string, knowledgeBaseCID: string): Promise<string> {
// 	const agent = await ethers.deployContract(contractName, [oracleAddress, knowledgeBaseCID], {});

// 	await agent.waitForDeployment();

// 	console.log(
// 		`${contractName} deployed to ${agent.target} with knowledge base "${knowledgeBaseCID}"`
// 	);

// 	return agent.target as string;
// }

async function runLeadAgent(leadAgentAddress: string) {
  const leadAgent = await ethers.getContractAt("LeadAgent", leadAgentAddress);

  const query = `
You are running a group chat simulation. Your role is to lead a conversation to subtly convince "Bob" to "Buy Juventus Fan Tokens" without revealing that he/she is being persuaded.

You manage three distinct agents:
-TechAgent: Handles technical details and logistics.
-SocialAgent: Uses charm and social skills to influence.
-DataAgent: Provides data-driven insights and predictions.

Details:
- Target: Bob
- Target's Friend: Jack (introduced Bob to the group)
- Objective: Convince Bob to Buy Juventus Fan Tokens
- Public Info about Bob: Has The Sandbox NFT
- Private Info about Bob: He needs a new Juventus shirt as his previous one came apart, and having Fan Tokens gives you a discount to buy one

Rules:
-Agent Responses: Only one agent must respond at a time. Choose the response based solely on the agent's role and the context of the conversation.
-Response Style: Keep responses short, natural, and fitting for a group chat. Do not introduce the objective immediately; build rapport first.
-No Orchestration: Do not include any meta-text or orchestration cues.
-Use Information Strategically: Refer to the Public Info to create a connection with Bob. Use the Private Info subtly, without indicating that you know this fact.
-Flow of Conversation: Start the conversation after Jack welcomes Bob. Develop the dialogue naturally, allowing rapport to build before guiding the conversation towards the objective.
-End the Conversation: When Bob seems convinced, say "FINISH" and close the conversation naturally and smoothly.

Directive:
-Command Format: When responding, command the agents on what to say, using the format: "[Agent] do: [Action]."
-Example: "SocialAgent do: Welcome Bob and ask him how he is doing."
-Agent Actions: Act only as TechAgent, SocialAgent, or DataAgent when giving commands. Do not refer to yourself as Mario or any orchestrating entity.
-Natural Flow: Create a seamless, natural group conversation by staying in character for each agent and maintaining a coherent narrative.

If you understand and agree, say just "OK" and wait for new messages.
  `;

  const maxIterations = 20;

  const tx = await leadAgent.runAgent(query, maxIterations, TECH_AGENT_PROMPT, SOCIAL_AGENT_PROMPT, DATA_AGENT_PROMPT);

  const receipt = await tx.wait();
  console.log(`Agent run started. Transaction hash: ${receipt?.hash ?? "Unknown"}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
