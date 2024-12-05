"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var hardhat_1 = require("hardhat");
var chai_1 = require("chai");
var viem_1 = require("viem");
var network_helpers_1 = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers");
var SetVestingManagerSettings_1 = require("../ignition/modules/SetVestingManagerSettings");
describe("VestingManager", function () {
    function deployStepVestingFixture() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, tokenOwner, alice, bob, marketPlaceholder, startTime, _b, endTime, steps, Manager;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                    case 1:
                        _a = _c.sent(), owner = _a[0], tokenOwner = _a[1], alice = _a[2], bob = _a[3], marketPlaceholder = _a[4];
                        _b = BigInt;
                        return [4 /*yield*/, network_helpers_1.time.latest()];
                    case 2:
                        startTime = _b.apply(void 0, [_c.sent()]);
                        endTime = startTime + BigInt(60 * 60 * 24 * 1000);
                        steps = BigInt(200);
                        return [4 /*yield*/, hardhat_1["default"].ignition.deploy(SetVestingManagerSettings_1["default"], {
                                parameters: {
                                    ERC20: {
                                        name: "Test Token",
                                        symbol: "TT",
                                        initialSupply: viem_1.parseEther("1000000")
                                    },
                                    DeployStepVestingAsOwner: {
                                        startTime: startTime,
                                        endTime: endTime,
                                        numOfSteps: steps
                                    }
                                }
                            })];
                    case 3:
                        Manager = _c.sent();
                        return [4 /*yield*/, Manager.manager.write.setMarketplace([marketPlaceholder.account.address])];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, Manager.token.write.transfer([tokenOwner.account.address, viem_1.parseEther("1000000")])];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, Manager.token.write.approve([Manager.vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, Manager.vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, { vesting: Manager.vesting, token: Manager.token, owner: owner, tokenOwner: tokenOwner, alice: alice, bob: bob, marketPlaceholder: marketPlaceholder, startTime: startTime, endTime: endTime, steps: steps, manager: Manager.manager }];
                }
            });
        });
    }
    describe("Deployment", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should deploy the contract correctly", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, startTime, endTime, steps, manager, _b, _c, _d, _e, settings;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _f.sent(), vesting = _a.vesting, token = _a.token, startTime = _a.startTime, endTime = _a.endTime, steps = _a.steps, manager = _a.manager;
                                    chai_1.expect(vesting.address).to.not.equal(0);
                                    chai_1.expect(token.address).to.not.equal(0);
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.startTime()];
                                case 2:
                                    _b.apply(void 0, [_f.sent()]).to.equal(startTime);
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.endTime()];
                                case 3:
                                    _c.apply(void 0, [_f.sent()]).to.equal(endTime);
                                    _d = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.numOfSteps()];
                                case 4:
                                    _d.apply(void 0, [_f.sent()]).to.equal(steps);
                                    _e = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.manager()];
                                case 5:
                                    _e.apply(void 0, [_f.sent()]).to.equal(manager.address);
                                    return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                                case 6:
                                    settings = _f.sent();
                                    chai_1.expect((settings)[0]).to.equal(true);
                                    chai_1.expect((settings)[1]).to.equal(2000);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("List", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should revert if the caller is not the marketplace", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager;
                                    return [4 /*yield*/, chai_1.expect(manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("1")])).to.be.revertedWith("caller is not marketplace")];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should record the correct sold amount and transferred the right amount to manager address", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder, allocs, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("200")], { account: marketPlaceholder.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, manager.read.allocations([alice.account.address, vesting.address])];
                                case 3:
                                    allocs = _c.sent();
                                    chai_1.expect(allocs[0]).to.equal(viem_1.parseEther("1000"));
                                    chai_1.expect(allocs[1]).to.equal(viem_1.parseEther("0"));
                                    chai_1.expect(allocs[2]).to.equal(viem_1.parseEther("200"));
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.available([manager.address])];
                                case 4:
                                    _b.apply(void 0, [(_c.sent())]).to.equal(viem_1.parseEther("200"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                // TODO To Change It To Rum code
                // it("Test123", async function () {
                //     let tokenIssuer,Bob,Cane,Damian,Ethan,Furlise,Geller
                //     [tokenIssuer,Bob,Cane,Damian,Ethan,Furlise,Geller] = await hre.ethers.getSigners();
                //     const vestingManager = await hre.ethers.deployContract("SecondSwap_VestingManager");
                //     const vestingDeployer = await hre.ethers.deployContract("SecondSwap_VestingDeployer")
                //     const token = await hre.ethers.deployContract("TestToken",["Test Token","TT",parseEther("1000000")])
                //     const startTime = BigInt(await time.latest());
                //     const endTime = startTime + BigInt(60 * 60 * 24 * 365 * 2);
                //     const steps = BigInt(365 * 2);
                //     console.log("token")
                //     console.log(vestingManager.target)
                //     console.log("stepVesting")
                //     const stepVesting= await hre.ethers.deployContract("SecondSwap_StepVesting",[tokenIssuer.address,vestingManager.target,token.target,startTime,endTime,steps,vestingDeployer.target])
                //     // console.log(stepVesting)
                //     await vestingManager.connect(Bob).setVestingSettings(stepVesting.target,false,20)
                // });
                it("should revert if the sell limit is hit in the same transaction", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, chai_1.expect(manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("201")], { account: marketPlaceholder.account })).to.be.revertedWith("cannot list more than max sell percent")];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should revert if the sell limit is hit in separate transactions", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("199")], { account: marketPlaceholder.account })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, chai_1.expect(manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("2")], { account: marketPlaceholder.account })).to.be.revertedWith("cannot list more than max sell percent")];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should revert if there is insufficient available allocation (claimed)", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, network_helpers_1.time.increase(60 * 60 * 24 * 300)];
                                case 2:
                                    _b.sent(); // 300 days 
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 3:
                                    _b.sent();
                                    return [4 /*yield*/, chai_1.expect(manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("701")], { account: marketPlaceholder.account })).to.be.revertedWith("insufficient availablility")];
                                case 4:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should revert if there is insufficient available allocation (transfer)", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, tokenOwner, alice, bob, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, viem_1.parseEther("800")], { account: tokenOwner.account })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, chai_1.expect(manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("400")], { account: marketPlaceholder.account })).to.be.revertedWith("insufficient availablility")];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("Unlist", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should revert if the caller is not the marketplace", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, chai_1.expect(manager.write.unlistVesting([alice.account.address, vesting.address, viem_1.parseEther("1")])).to.be.revertedWith("caller is not marketplace")];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should update the correct sold amount and transfer the right amount back", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder, allocs, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("133")], { account: marketPlaceholder.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, manager.write.unlistVesting([alice.account.address, vesting.address, viem_1.parseEther("98")], { account: marketPlaceholder.account })];
                                case 3:
                                    _d.sent();
                                    return [4 /*yield*/, manager.read.allocations([alice.account.address, vesting.address])];
                                case 4:
                                    allocs = _d.sent();
                                    chai_1.expect(allocs[0]).to.equal(viem_1.parseEther("1000"));
                                    chai_1.expect(allocs[1]).to.equal(viem_1.parseEther("0"));
                                    chai_1.expect(allocs[2]).to.equal(viem_1.parseEther("35"));
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.available([manager.address])];
                                case 5:
                                    _b.apply(void 0, [_d.sent()]).to.equal(viem_1.parseEther("35"));
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.available([alice.account.address])];
                                case 6:
                                    _c.apply(void 0, [_d.sent()]).to.equal(viem_1.parseEther("965"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should revert if unlist amount is more than sold amount", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("56")], { account: marketPlaceholder.account })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, chai_1.expect(manager.write.unlistVesting([alice.account.address, vesting.address, viem_1.parseEther("57")], { account: marketPlaceholder.account })).to.be.reverted];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("Complete purchase", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should revert if the caller is not the marketplace", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, manager, marketPlaceholder;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, alice = _a.alice, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, chai_1.expect(manager.write.completePurchase([alice.account.address, vesting.address, viem_1.parseEther("1")])).to.be.revertedWith("caller is not marketplace")];
                                case 2:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should transfer the correct amount to the buyer and update the sold amount", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, alice, bob, manager, marketPlaceholder, allocs, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, alice = _a.alice, bob = _a.bob, manager = _a.manager, marketPlaceholder = _a.marketPlaceholder;
                                    return [4 /*yield*/, manager.write.listVesting([alice.account.address, vesting.address, viem_1.parseEther("200")], { account: marketPlaceholder.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, manager.write.completePurchase([bob.account.address, vesting.address, viem_1.parseEther("20")], { account: marketPlaceholder.account })];
                                case 3:
                                    _d.sent();
                                    return [4 /*yield*/, manager.read.allocations([alice.account.address, vesting.address])];
                                case 4:
                                    allocs = _d.sent();
                                    chai_1.expect(allocs[0]).to.equal(viem_1.parseEther("1000"));
                                    chai_1.expect(allocs[1]).to.equal(viem_1.parseEther("0"));
                                    chai_1.expect(allocs[2]).to.equal(viem_1.parseEther("200"));
                                    return [4 /*yield*/, manager.read.allocations([bob.account.address, vesting.address])];
                                case 5:
                                    allocs = _d.sent();
                                    chai_1.expect(allocs[0]).to.equal(viem_1.parseEther("20"));
                                    chai_1.expect(allocs[1]).to.equal(viem_1.parseEther("20"));
                                    chai_1.expect(allocs[2]).to.equal(viem_1.parseEther("0"));
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.available([manager.address])];
                                case 6:
                                    _b.apply(void 0, [_d.sent()]).to.equal(viem_1.parseEther("180"));
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.available([bob.account.address])];
                                case 7:
                                    _c.apply(void 0, [_d.sent()]).to.equal(viem_1.parseEther("20"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    // Add more test cases here
});
