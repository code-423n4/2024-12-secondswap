import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import VestingDeployer from "./DeployVestingDeployerProxies";

export default buildModule("DeployVestingManager", (m) => {
    // Deploy token and settings with required parameters
    const s2Admin = m.getAccount(1)
    const deployer = m.useModule(VestingDeployer);

    // Deploy the implementation contract
    const implementation = m.contract(
        "SecondSwap_VestingManager"
    );
    
    // Create the initialization data
    const initData = m.encodeFunctionCall(
        implementation, 
        "initialize", 
        [s2Admin]
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
        id: "vestingManagerProxyAdmin"
    });

    // Get the proxied marketplace contract with unique ID
    const proxiedVestingManager = m.contractAt(
        "SecondSwap_VestingManager",
        proxy,
        {
            id: "proxiedVestingManager"
        }
    );

    // Set the VestingDeployer in the manager
    m.call(proxiedVestingManager, "setVestingDeployer", [deployer.proxiedVestingDeployer], { from: s2Admin });
    
    // Set the manager in the VestingDeployer proxy using the proxied contract
    m.call(deployer.proxiedVestingDeployer, "setManager", [proxiedVestingManager], { from: s2Admin });

    return { 
        implementation,
        proxy,
        proxyAdmin,
        manager:proxiedVestingManager,
        deployerProxy: deployer.proxiedVestingDeployer 
    };
});