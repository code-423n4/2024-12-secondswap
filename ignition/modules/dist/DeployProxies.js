"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
var s2admin = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
var s2dev = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
var vestingManager = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
var whitelistDeployer = "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5";
var token = "0x89Aad8E9d593F1879bCC4e59C06C6892ff9cD0f3";
var proxyModule = modules_1.buildModule("ProxyModule", function (m) {
    var demo = m.contract("SecondSwap_VestingDeployer");
    var proxy = m.contract("TransparentUpgradeableProxy", [
        demo,
        s2dev,
        "0x",
    ]);
    var proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");
    var proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);
    return { proxyAdmin: proxyAdmin, proxy: proxy };
});
