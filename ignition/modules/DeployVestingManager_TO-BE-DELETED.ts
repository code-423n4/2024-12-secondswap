import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import VestingDeployer from "./DeployVestingDeployerProxies";

export default buildModule("DeployVestingManager", (m) => {
  const s2Admin = m.getAccount(1)
  
  const deployer = m.useModule(VestingDeployer);
  const manager = m.contract("SecondSwap_VestingManager", [s2Admin]);

  // Set the VestingDeployer in the manager
  m.call(manager, "setVestingDeployer", [deployer.proxiedVestingDeployer], { from: s2Admin });
  
  // Set the manager in the VestingDeployer proxy using the proxied contract
  m.call(deployer.proxiedVestingDeployer, "setManager", [manager], { from: s2Admin });

  return { 
    manager,
    deployerProxy: deployer.proxiedVestingDeployer 
  };
});
