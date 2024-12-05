"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
exports["default"] = modules_1.buildModule("DeployWhitelistDeployer", function (m) {
    var deployedWhitelist = m.contract("SecondSwap_WhitelistDeployer");
    return { deployedWhitelist: deployedWhitelist };
});
