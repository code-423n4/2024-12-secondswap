import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployWhitelistDeployer from "./DeployWhitelistDeployer";
import DeployVestingManager from "./DeployVestingManagerProxies";
import ERC20 from "./ERC20";

export default buildModule("DeployMarketplaceSetting", (m) => {
    const s2Admin = m.getAccount(1)
    const feeCollector = m.getAccount(3)
    
    const whitelistDeployer = m.useModule(DeployWhitelistDeployer)
    const vestingManager = m.useModule(DeployVestingManager)
    const token = m.useModule(ERC20);

    const marketplaceSetting = m.contract("SecondSwap_MarketplaceSetting", [
        feeCollector,
        s2Admin,
        whitelistDeployer.deployedWhitelist,
        vestingManager.manager,
        token.token
    ]);

    return {
        marketplaceSetting: marketplaceSetting,
        whitelistDeployer: whitelistDeployer.deployedWhitelist,
        vestingManager: vestingManager.manager,
    };
});

