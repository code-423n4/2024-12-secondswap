"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
var DeployVestingManager_1 = require("./DeployVestingManager");
var DeployWhitelistDeployer_1 = require("./DeployWhitelistDeployer");
var ERC20_1 = require("./ERC20");
exports["default"] = modules_1.buildModule("DeployMarketplace", function (m) {
    var vestingManager = m.useModule(DeployVestingManager_1["default"]);
    var whitelistDeployer = m.useModule(DeployWhitelistDeployer_1["default"]);
    var token = m.useModule(ERC20_1["default"]);
    var s2admin = m.getParameter("s2admin");
    var s2dev = m.getParameter("s2dev");
    // const s2admin = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
    // const s2dev = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
    // const token = "0x89Aad8E9d593F1879bCC4e59C06C6892ff9cD0f3";
    var deployedMarketplace = m.contract("SecondSwap_Marketplace", [
        vestingManager.manager,
        whitelistDeployer.deployedWhitelist,
        s2admin,
        s2dev,
        token.token
    ]);
    // Set the marketplace address in the VestingManager contract
    m.call(vestingManager.manager, "setMarketplace", [deployedMarketplace]);
    return {
        manager: vestingManager.manager,
        marketplace: deployedMarketplace,
        whitelistDeployer: whitelistDeployer.deployedWhitelist,
        token: token.token
    };
});
