"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
var VestingDeployer_1 = require("./VestingDeployer");
exports["default"] = modules_1.buildModule("DeployVestingManager", function (m) {
    var s2dev = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
    var s2admin = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
    // const manager = m.contract("SecondSwap_VestingManager");
    var Deployer = m.useModule(VestingDeployer_1["default"]);
    var manager = m.contract("SecondSwap_VestingManager", [s2dev, s2admin]);
    m.call(Deployer.deployer, "setManager", [manager]);
    m.call(Deployer.deployer, "setManager", [manager]);
    m.call(manager, "setVestingDeployer", [Deployer.deployer]);
    // m.call(manager, "setMarketplace", [feeCollectorAddress]);
    return { manager: manager };
});
