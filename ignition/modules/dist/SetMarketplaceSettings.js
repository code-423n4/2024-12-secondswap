"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
var DeployMarketplace_1 = require("./DeployMarketplace");
var SetVestingManagerSettings_1 = require("./SetVestingManagerSettings");
exports["default"] = modules_1.buildModule("SetMarketplace", function (m) {
    var marketplace = m.useModule(DeployMarketplace_1["default"]);
    var manager = m.useModule(SetVestingManagerSettings_1["default"]);
    return { marketplace: marketplace.marketplace, manager: manager.manager, vesting: manager.vesting, token: marketplace.token };
});
