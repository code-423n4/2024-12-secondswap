import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployWhitelistDeployer", (m) => {
    const deployedWhitelist = m.contract("SecondSwap_WhitelistDeployer");

    return {deployedWhitelist};
});
