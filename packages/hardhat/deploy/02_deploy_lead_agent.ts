import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { LeadAgent } from "../typechain-types";

const AGENT_PROMPT = "You are a helpful assistant";

const deployAll: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const oracleAddress = process.env.ORACLE_ADDRESS;
  if (!oracleAddress) {
    throw new Error("ORACLE_ADDRESS is not set in the environment variables");
  }

  console.log("Deploying contracts with the account:", deployer);

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
    const instance = await deploy(contract, {
      from: deployer,
      args: [],
      log: true,
    });
    console.log(`${name} deployed to: ${instance.address}`);
    deployedFactories.push({ name, address: instance.address });
  }

  console.log("All factories deployed successfully");

  // Create a map of factory addresses
  const factoryAddresses = Object.fromEntries(deployedFactories.map(({ name, address }) => [name, address]));

  console.log("Factory addresses:", factoryAddresses);

  // Deploy LeadAgent
  console.log("Deploying LeadAgent...");
  const leadAgent = await deploy("LeadAgent", {
    from: deployer,
    args: [
      oracleAddress,
      AGENT_PROMPT,
      factoryAddresses.TechAgentFactory,
      factoryAddresses.SocialAgentFactory,
      factoryAddresses.DataAgentFactory,
    ],
    log: true,
    gasLimit: 15000000,
  });

  console.log(`LeadAgent deployed to ${leadAgent.address}`);

  console.log(`Verify LeadAgent, TechAgent, SocialAgent, DataAgent:`);
  console.log(
    `npx hardhat verify --network galadriel "${leadAgent.address}" "${oracleAddress}" "You are a helpful assistant" "${factoryAddresses.TechAgentFactory}" "${factoryAddresses.SocialAgentFactory}" "${factoryAddresses.DataAgentFactory}"`,
  );
  // Get the deployed agent addresses
  const leadAgentContract = (await hre.ethers.getContract("LeadAgent")) as LeadAgent;
  const techAgentAddress = await leadAgentContract.techAgent();
  const socialAgentAddress = await leadAgentContract.socialAgent();
  const dataAgentAddress = await leadAgentContract.dataAgent();

  console.log(
    `npx hardhat verify --network galadriel --contract contracts/BaseAgent.sol:BaseAgent "${techAgentAddress}" "${oracleAddress}"`,
  );

  console.log(
    `npx hardhat verify --network galadriel --contract contracts/BaseAgent.sol:BaseAgent "${socialAgentAddress}" "${oracleAddress}"`,
  );

  console.log(
    `npx hardhat verify --network galadriel --contract contracts/BaseAgent.sol:BaseAgent "${dataAgentAddress}" "${oracleAddress}"`,
  );
};

export default deployAll;

deployAll.tags = ["LeadAgent"];
