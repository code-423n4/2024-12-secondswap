import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VestingDeployerProxyModule", (m) => {
    const s2Admin = m.getAccount(1);
    
    // Deploy the implementation contract first
    const implementation = m.contract(
        "SecondSwap_VestingDeployer"
    );
    
    // Create the initialization data with temporary manager address
    const initData = m.encodeFunctionCall(
        implementation, 
        "initialize", 
        [s2Admin, "0x0000000000000000000000000000000000000000"]
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
        id: "vestingDeployerProxyAdmin"
    });
    
    // Get the proxied vesting deployer with unique ID
    const proxiedVestingDeployer = m.contractAt(
        "SecondSwap_VestingDeployer",
        proxy,
        {
            id: "proxiedVestingDeployer"
        }
    );

    return {
        implementation,
        // proxy,
        proxyAdmin,
        proxiedVestingDeployer
    };
});