import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VestingDeployerProxyModule", (m) => {
    // Get the s2Admin account
    const s2Admin = m.getAccount(1);
    
    // Deploy the implementation contract
    const implementation = m.contract(
        "SecondSwap_VestingDeployer_V2"
    );
    
    // Create the initialization data with temporary manager address
    // Manager will be set later via setManager
    const initData = m.encodeFunctionCall(
        implementation, 
        "initialize", 
        [s2Admin, "0x"]
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

    // Deploy the ProxyAdmin contract
    const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

    return {
        implementation,
        proxy,
        proxyAdmin
    };
});