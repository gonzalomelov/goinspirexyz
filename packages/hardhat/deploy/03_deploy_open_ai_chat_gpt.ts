import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployAll: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const oracleAddress = process.env.ORACLE_ADDRESS;
  if (!oracleAddress) {
    throw new Error("ORACLE_ADDRESS is not set in the environment variables");
  }

  console.log("Deploying contracts with the account:", deployer);

  // Deploy OpenAiChatGpt
  console.log("Deploying OpenAiChatGpt...");
  const OpenAiChatGpt = await deploy("PrevOpenAiChatGpt", {
    from: deployer,
    args: [oracleAddress],
    log: true,
  });

  console.log(`OpenAiChatGpt deployed to ${OpenAiChatGpt.address}`);
};

export default deployAll;

deployAll.tags = ["OpenAiChatGpt"];
