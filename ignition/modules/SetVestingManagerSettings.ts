import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployVestingManager from "./DeployVestingManagerProxies";
import DeployStepVestingAsOwner from "./DeployStepVestingAsOwner";

export default buildModule("SetVestingManagerSettings", (m) => {
  const s2Admin = m.getAccount(1)
  const manager = m.useModule(DeployVestingManager);
  const vesting = m.useModule(DeployStepVestingAsOwner);
  // m.call(manager.manager, "setVestingSettings", [vesting.vesting, true, 20])

  return { manager: manager.manager, vesting: vesting.vesting, token: vesting.token };
});