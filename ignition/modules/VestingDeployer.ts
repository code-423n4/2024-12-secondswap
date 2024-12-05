import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VestingDeployer", (m) => {
  const s2Admin = m.getAccount(1)

  const deployer = m.contract("SecondSwap_VestingDeployer",[
    s2Admin
  ]);

  return { deployer: deployer };
});