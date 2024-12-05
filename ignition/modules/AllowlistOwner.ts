import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployVestingManager from "./DeployVestingManagerProxies";
import ERC20 from "./ERC20";

export default buildModule("AllowlistOwner", (m) => {
  const token = m.useModule(ERC20);
  const vestingManager = m.useModule(DeployVestingManager);
  const s2Admin = m.getAccount(1)
  
  m.call(vestingManager.deployerProxy, "setTokenOwner", [token.token, s2Admin], {from: s2Admin});

  return { deployer: vestingManager.deployerProxy };
});
