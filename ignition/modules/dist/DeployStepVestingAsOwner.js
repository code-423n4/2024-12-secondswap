"use strict";
exports.__esModule = true;
var modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
var ERC20_1 = require("./ERC20");
var VestingDeployer_1 = require("./VestingDeployer");
var AllowlistOwner_1 = require("./AllowlistOwner");
var DeployVestingManager_1 = require("./DeployVestingManager");
exports["default"] = modules_1.buildModule("DeployStepVestingAsOwner", function (m) {
    var token = m.useModule(ERC20_1["default"]);
    var allowlist = m.useModule(AllowlistOwner_1["default"]);
    var tokenOwner = m.getAccount(1);
    var Manager = m.useModule(DeployVestingManager_1["default"]);
    var vestingDeployer = m.useModule(VestingDeployer_1["default"]);
    var deploymentTx = m.call(allowlist.deployer, "deployVesting", [token.token, m.getParameter("startTime"), m.getParameter("endTime"), m.getParameter("numOfSteps"), vestingDeployer.deployer], { from: tokenOwner, after: [Manager.manager] });
    var vestingAddress = m.readEventArgument(deploymentTx, "VestingDeployed", 1);
    var vesting = m.contractAt("SecondSwap_StepVesting", vestingAddress);
    return { vesting: vesting, token: token.token, deployer: allowlist.deployer };
});
