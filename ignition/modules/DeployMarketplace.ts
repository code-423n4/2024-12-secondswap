import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployVestingManager from "./DeployVestingManagerProxies";
import DeployWhitelistDeployer from "./DeployWhitelistDeployer";
import DeployMarketplaceSetting from "./DeployMarketplaceSetting";
import ERC20 from "./ERC20";
export default buildModule("DeployMarketplace", (m) => {
    const s2Admin = m.getAccount(1)

    const marketPlaceSetting = m.useModule(DeployMarketplaceSetting) 

    const vestingManager = m.useModule(DeployVestingManager);
    const whitelistDeployer = m.useModule(DeployWhitelistDeployer);
    
    const token = m.useModule(ERC20);
    
    const deployedMarketplace = m.contract("SecondSwap_Marketplace", [
        marketPlaceSetting.marketplaceSetting,
        token.token,

    ]
);

    // Set the marketplace address in the VestingManager contract
    m.call(vestingManager.manager, "setMarketplace", [deployedMarketplace],{from: s2Admin});

    return {
        manager: vestingManager.manager,
        marketplace: deployedMarketplace,
        whitelistDeployer: whitelistDeployer.deployedWhitelist,
        token:token.token,
        marketPlaceSetting: marketPlaceSetting.marketplaceSetting
    };

});