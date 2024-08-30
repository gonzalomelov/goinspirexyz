import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTodoList: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("TodoList", {
    from: deployer,
    // Contract constructor arguments (if any)
    args: [],
    log: true,
    autoMine: true,
  });

  const todoList = await hre.ethers.getContract("TodoList", deployer);
  console.log("🗒️ TodoList deployed:", await todoList.getAddress());
};

export default deployTodoList;

deployTodoList.tags = ["TodoList"];
