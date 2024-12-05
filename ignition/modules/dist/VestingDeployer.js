"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
exports["default"] = modules_1.buildModule("VestingDeployer", function (m) {
    var deployer = m.contract("SecondSwap_VestingDeployer");
    return { deployer: deployer };
});
