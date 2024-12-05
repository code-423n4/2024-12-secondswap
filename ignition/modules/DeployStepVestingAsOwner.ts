import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ERC20 from "./ERC20";
import VestingDeployer from "./DeployVestingDeployerProxies";
import AllowlistOwner from "./AllowlistOwner";
import DeployVestingManager from "./DeployVestingManagerProxies";

export default buildModule("DeployStepVestingAsOwner", (m) => {
  const token = m.useModule(ERC20);
  const allowlist = m.useModule(AllowlistOwner);
  const s2Admin = m.getAccount(1)
  const Manager = m.useModule(DeployVestingManager);
  const vestingDeployer = m.useModule(VestingDeployer);

  const deploymentTx = m.call(
    allowlist.deployer, 
    "deployVesting", 
    [
      token.token, 
      m.getParameter("startTime",1732517966), 
      m.getParameter("endTime",1732604366), 
      m.getParameter("numOfSteps",250),
      vestingDeployer.implementation
    ], 
    { 
      from: s2Admin, 
      after: [Manager.manager] 
    }
  );
  
  const vestingAddress = m.readEventArgument(deploymentTx, "VestingDeployed", 1);
  
  // Add unique ID for the contractAt call
  const vesting = m.contractAt("SecondSwap_StepVesting", vestingAddress, {
    id: "deployedStepVesting"
  });
  
  return { 
    vesting: vesting, 
    token: token.token, 
    deployer: allowlist.deployer 
  };
});
