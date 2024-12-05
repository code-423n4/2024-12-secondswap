import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployMarketplaceSetting from "./DeployMarketplaceSetting";
import ERC20 from "./ERC20";
import DeployStepVestingAsOwner from "./DeployStepVestingAsOwner";

export default buildModule("MarketplaceProxyModule", (m) => {
    // Deploy token and settings with required parameters
    const token = m.useModule(ERC20);
    // const token = "0x89Aad8E9d593F1879bCC4e59C06C6892ff9cD0f3";
    const s2Admin = m.getAccount(1);
    const marketplaceSetting = m.useModule(DeployMarketplaceSetting);
    const vesting = m.useModule(DeployStepVestingAsOwner);

    // Deploy the implementation contract
    const implementation = m.contract(
        "SecondSwap_Marketplace"
    );
    
    // Create the initialization data
    const initData = m.encodeFunctionCall(
        implementation, 
        "initialize", 
        [token.token, marketplaceSetting.marketplaceSetting]
        // [token, marketplaceSetting.marketplaceSetting]
    );

    // Deploy the TransparentUpgradeableProxy contract
    const proxy = m.contract("TransparentUpgradeableProxy", [
        implementation,
        s2Admin,
        initData
    ]);

    // Get the ProxyAdmin address
    const proxyAdminAddress = m.readEventArgument(
        proxy,
        "AdminChanged",
        "newAdmin"
    );

    // Deploy the ProxyAdmin contract with unique ID
    const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress, {
        id: "marketplaceProxyAdmin"
    });

    // Set the marketplace address in the VestingManager contract
    m.call(marketplaceSetting.vestingManager, "setMarketplace", [proxy],{from: s2Admin});

    return {
        implementation,
        proxy,
        proxyAdmin,
        marketplaceSetting: marketplaceSetting.marketplaceSetting,
        vestingManager: marketplaceSetting.vestingManager,
        whitelist: marketplaceSetting.whitelistDeployer,
        token: token.token,
        // proxiedMarketplace,
        vesting: vesting.vesting
    };
});