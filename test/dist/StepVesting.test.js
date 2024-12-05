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
var DeployStepVestingAsOwner_1 = require("../ignition/modules/DeployStepVestingAsOwner");
var network_helpers_1 = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers");
describe("StepVesting", function () {
    function deployStepVestingFixture() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, tokenOwner, alice, bob, startTime, _b, endTime, steps, Vesting;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                    case 1:
                        _a = _c.sent(), owner = _a[0], tokenOwner = _a[1], alice = _a[2], bob = _a[3];
                        _b = BigInt;
                        return [4 /*yield*/, network_helpers_1.time.latest()];
                    case 2:
                        startTime = _b.apply(void 0, [_c.sent()]);
                        endTime = startTime + BigInt(60 * 60 * 24 * 365 * 2);
                        steps = BigInt(365 * 2);
                        return [4 /*yield*/, hardhat_1["default"].ignition.deploy(DeployStepVestingAsOwner_1["default"], {
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
                        Vesting = _c.sent();
                        return [4 /*yield*/, Vesting.token.write.transfer([tokenOwner.account.address, viem_1.parseEther("1000000")])];
                    case 4:
                        _c.sent();
                        return [2 /*return*/, { vesting: Vesting.vesting, token: Vesting.token, owner: owner, tokenOwner: tokenOwner, alice: alice, bob: bob, startTime: startTime, endTime: endTime, steps: steps }];
                }
            });
        });
    }
    describe("Deployment", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should deploy the contract correctly", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, startTime, endTime, steps, _b, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _e.sent(), vesting = _a.vesting, token = _a.token, startTime = _a.startTime, endTime = _a.endTime, steps = _a.steps;
                                    chai_1.expect(vesting.address).to.not.equal(0);
                                    chai_1.expect(token.address).to.not.equal(0);
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.startTime()];
                                case 2:
                                    _b.apply(void 0, [_e.sent()]).to.equal(startTime);
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.endTime()];
                                case 3:
                                    _c.apply(void 0, [_e.sent()]).to.equal(endTime);
                                    _d = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.numOfSteps()];
                                case 4:
                                    _d.apply(void 0, [_e.sent()]).to.equal(steps);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("Claiming", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should set the correct release rate", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, releaseRate;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _b.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _b.sent();
                                    return [4 /*yield*/, vesting.read._vestings([alice.account.address])];
                                case 4:
                                    releaseRate = (_b.sent())["2"];
                                    chai_1.expect(releaseRate).to.equal(viem_1.parseEther("1000") / BigInt(365 * 2));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct full amount if no claims are made", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, _b, balance;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 365 * 2;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _c.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_c.sent())[1]]).to.equal(BigInt(730));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 6:
                                    _c.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _c.sent();
                                    chai_1.expect(balance).to.equal(viem_1.parseEther("1000"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount at 235 cycles", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, _b, balance, expected;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 235;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _c.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_c.sent())[1]]).to.equal(BigInt(235));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 6:
                                    _c.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _c.sent();
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(235);
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount at 93, 433 and full schedule", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, _b, balance, expected, _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _e.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 93;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _e.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _e.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _e.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_e.sent())[1]]).to.equal(BigInt(93));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 6:
                                    _e.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _e.sent();
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(93);
                                    chai_1.expect(balance).to.equal(expected);
                                    // 433 - 93 = 340
                                    duration = 60 * 60 * 24 * 433 - duration;
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 8:
                                    _e.sent();
                                    // Check if claimable steps are correct
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 9:
                                    // Check if claimable steps are correct
                                    _c.apply(void 0, [(_e.sent())[1]]).to.equal(BigInt(340));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 10:
                                    _e.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 11:
                                    balance = (_e.sent());
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(433);
                                    chai_1.expect(balance).to.be.equals(expected);
                                    // 730 - 433 = 297
                                    duration = 60 * 60 * 24 * 730 - duration;
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 12:
                                    _e.sent();
                                    // Check if claimable steps are correct
                                    _d = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 13:
                                    // Check if claimable steps are correct
                                    _d.apply(void 0, [(_e.sent())[1]]).to.equal(BigInt(297));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 14:
                                    _e.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 15:
                                    balance = (_e.sent());
                                    expected = viem_1.parseEther("1000");
                                    chai_1.expect(balance).to.be.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount after adding a new vesting", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, _b, balance;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 365 * 2;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("3500")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("2500")], { account: tokenOwner.account })];
                                case 4:
                                    _c.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 5:
                                    _c.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 6:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_c.sent())[1]]).to.equal(BigInt(730));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 7:
                                    _c.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 8:
                                    balance = _c.sent();
                                    chai_1.expect(balance).to.equal(viem_1.parseEther("3500"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount after 55 cycles before adding a new vesting and claiming at 87 cycles", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, releaseRate, _b, balance, expected, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 55;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("3500")], { account: tokenOwner.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _d.sent();
                                    releaseRate = viem_1.parseEther("1000") / BigInt(365 * 2);
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(55));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 6:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _d.sent();
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(55);
                                    chai_1.expect(balance).to.equal(expected);
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("2500")], { account: tokenOwner.account })];
                                case 8:
                                    _d.sent();
                                    // 87 - 55 = 32
                                    duration = 60 * 60 * 24 * 87 - duration;
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 9:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 10:
                                    // Check if claimable steps are correct
                                    _c.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(32));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 11:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 12:
                                    // Check if claimed amount is correct
                                    balance = _d.sent();
                                    releaseRate = (viem_1.parseEther("3500") - expected) / (BigInt(365 * 2) - BigInt(55));
                                    expected = expected + BigInt(32) * releaseRate;
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should not be able to claim the token before the cliff period", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, duration, _b, balance;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice;
                                    duration = 60 * 60 * 24 * 365 * 2;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _c.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_c.sent())[1]]).to.equal(BigInt(730));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 6:
                                    _c.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _c.sent();
                                    chai_1.expect(balance).to.equal(viem_1.parseEther("1000"));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("Transfer", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should transfer if initiator is tokenOwner", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 4:
                                    _b.apply(void 0, [_c.sent()]).to.not.be.reverted;
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should transfer if initiator is manager", function () {
                    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); });
                }).skip();
                it("should revert transfer if initiator is not tokenOwner or manager", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, alice, bob;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, bob = _a.bob;
                                    return [4 /*yield*/, chai_1.expect(vesting.write.transferVesting([alice.account.address, bob.account.address, viem_1.parseEther("1000")])).to.be.revertedWith("unauthorized")];
                                case 2:
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
    describe("Transfer and Claiming", function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                it("should transfer the correct amount and claim the correct amount when there is no premature claims", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, duration, _b, balance, expected, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    duration = 60 * 60 * 24 * 365 * 2;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _d.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, viem_1.parseEther("245")], { account: tokenOwner.account })
                                        // Check if claimable steps are correct
                                    ];
                                case 5:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 6:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(730));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 7:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 8:
                                    balance = _d.sent();
                                    expected = viem_1.parseEther("755");
                                    chai_1.expect(balance).to.equal(expected);
                                    // Check if claimable steps are correct
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([bob.account.address])];
                                case 9:
                                    // Check if claimable steps are correct
                                    _c.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(730));
                                    return [4 /*yield*/, vesting.write.claim({ account: bob.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 10:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([bob.account.address])];
                                case 11:
                                    // Check if claimed amount is correct
                                    balance = _d.sent();
                                    expected = viem_1.parseEther("245");
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount, transfer 62% to user B, and claim the correct amount with claims at 600 for user A", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, duration, _b, balance, expected, amountB, _c, releaseRate, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _e.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    duration = 60 * 60 * 24 * 75;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _e.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _e.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _e.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 5:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_e.sent())[1]]).to.equal(BigInt(75));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 6:
                                    _e.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    balance = _e.sent();
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(75);
                                    chai_1.expect(balance).to.equal(expected);
                                    amountB = viem_1.parseEther("1000") * BigInt(62) / BigInt(100);
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], { account: tokenOwner.account })
                                        // 600 - 75 = 525
                                    ];
                                case 8:
                                    _e.sent();
                                    // 600 - 75 = 525
                                    duration = 60 * 60 * 24 * 600 - duration;
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 9:
                                    _e.sent();
                                    // Check if claimable steps are correct
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 10:
                                    // Check if claimable steps are correct
                                    _c.apply(void 0, [(_e.sent())[1]]).to.equal(BigInt(525));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 11:
                                    _e.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 12:
                                    // Check if claimed amount is correct
                                    balance = _e.sent();
                                    releaseRate = (viem_1.parseEther("1000") - amountB) / (BigInt(365 * 2));
                                    _d = chai_1.expect;
                                    return [4 /*yield*/, vesting.read._vestings([alice.account.address])];
                                case 13:
                                    _d.apply(void 0, [(_e.sent())[2]]).to.equal(releaseRate);
                                    expected = expected + releaseRate * BigInt(525);
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should transfer the correct amount and claim the correct amount with claims at 75 for user A and 500 for user B", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, duration, _b, balance, expected, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    duration = 60 * 60 * 24 * 75;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _d.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, viem_1.parseEther("245")], { account: tokenOwner.account })
                                        // Check if claimable steps are correct
                                    ];
                                case 5:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([alice.account.address])];
                                case 6:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(75));
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 7:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 8:
                                    balance = _d.sent();
                                    expected = viem_1.parseEther("755") / BigInt(365 * 2) * BigInt(75);
                                    chai_1.expect(balance).to.equal(expected);
                                    // 500 - 75 = 425
                                    duration = 60 * 60 * 24 * 500 - duration;
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 9:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([bob.account.address])];
                                case 10:
                                    // Check if claimable steps are correct
                                    _c.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(500));
                                    return [4 /*yield*/, vesting.write.claim({ account: bob.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 11:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([bob.account.address])];
                                case 12:
                                    // Check if claimed amount is correct
                                    balance = _d.sent();
                                    expected = viem_1.parseEther("245") / BigInt(365 * 2) * BigInt(500);
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should transfer 34% to user B at 111 and user B should able to claim 111 cycles immediately", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, duration, amountB, _b, balance, expected;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _c.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    duration = 60 * 60 * 24 * 111;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _c.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _c.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _c.sent();
                                    amountB = viem_1.parseEther("1000") * BigInt(34) / BigInt(100);
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], { account: tokenOwner.account })
                                        // Check if claimable steps are correct
                                    ];
                                case 5:
                                    _c.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([bob.account.address])];
                                case 6:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_c.sent())[1]]).to.equal(BigInt(111));
                                    return [4 /*yield*/, vesting.write.claim({ account: bob.account })
                                        // Check if claimed amount is correct
                                    ];
                                case 7:
                                    _c.sent();
                                    return [4 /*yield*/, token.read.balanceOf([bob.account.address])];
                                case 8:
                                    balance = _c.sent();
                                    expected = amountB / BigInt(365 * 2) * BigInt(111);
                                    chai_1.expect(balance).to.equal(expected);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should claim the correct amount at 444 for user A, transfer 1% to user B, and user B should be able to claim starting from 445", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, duration, expected, balance, amountB, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _d.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    duration = 60 * 60 * 24 * 444;
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _d.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                                case 4:
                                    _d.sent();
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 5:
                                    _d.sent();
                                    expected = viem_1.parseEther("1000") / BigInt(365 * 2) * BigInt(444);
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 6:
                                    balance = _d.sent();
                                    chai_1.expect(balance).to.equal(expected);
                                    amountB = viem_1.parseEther("1000") * BigInt(1) / BigInt(100);
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], { account: tokenOwner.account })
                                        // Check if claimable steps are correct
                                    ];
                                case 7:
                                    _d.sent();
                                    // Check if claimable steps are correct
                                    _b = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([bob.account.address])];
                                case 8:
                                    // Check if claimable steps are correct
                                    _b.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(0));
                                    return [4 /*yield*/, chai_1.expect(vesting.write.claim({ account: bob.account })).to.be.revertedWith("nothing to claim")];
                                case 9:
                                    _d.sent();
                                    return [4 /*yield*/, network_helpers_1.time.increase(60 * 60 * 24)];
                                case 10:
                                    _d.sent();
                                    _c = chai_1.expect;
                                    return [4 /*yield*/, vesting.read.claimable([bob.account.address])];
                                case 11:
                                    _c.apply(void 0, [(_d.sent())[1]]).to.equal(BigInt(1));
                                    return [4 /*yield*/, vesting.write.claim({ account: bob.account })];
                                case 12:
                                    _d.sent();
                                    return [4 /*yield*/, token.read.balanceOf([bob.account.address])];
                                case 13:
                                    // Check if claimed amount is correct
                                    balance = _d.sent();
                                    expected = amountB / BigInt(286) * BigInt(1);
                                    chai_1.expect(balance).to.equal(BigInt(expected));
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                it("should handle transfer from A to B, A claiming 10%, and B transferring back to A", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _a, vesting, token, tokenOwner, alice, bob, transferAmount, totalDuration, aliceBalance, expectedAliceClaim, aliceVesting, bobVesting, finalAliceBalance;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployStepVestingFixture)];
                                case 1:
                                    _a = _b.sent(), vesting = _a.vesting, token = _a.token, tokenOwner = _a.tokenOwner, alice = _a.alice, bob = _a.bob;
                                    // Initial setup
                                    return [4 /*yield*/, token.write.approve([vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 2:
                                    // Initial setup
                                    _b.sent();
                                    return [4 /*yield*/, vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                                case 3:
                                    _b.sent();
                                    transferAmount = viem_1.parseEther("500");
                                    return [4 /*yield*/, vesting.write.transferVesting([alice.account.address, bob.account.address, transferAmount], { account: tokenOwner.account })];
                                case 4:
                                    _b.sent();
                                    totalDuration = BigInt(60 * 60 * 24 * 365 * 2);
                                    return [4 /*yield*/, network_helpers_1.time.increase(totalDuration / BigInt(10))];
                                case 5:
                                    _b.sent();
                                    // A claims their 10%
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 6:
                                    // A claims their 10%
                                    _b.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 7:
                                    aliceBalance = _b.sent();
                                    expectedAliceClaim = viem_1.parseEther("50");
                                    chai_1.expect(aliceBalance).to.be.closeTo(expectedAliceClaim, viem_1.parseEther("0.1")); // Allow small rounding difference
                                    // B transfers back to A
                                    return [4 /*yield*/, vesting.write.transferVesting([bob.account.address, alice.account.address, transferAmount], { account: tokenOwner.account })];
                                case 8:
                                    // B transfers back to A
                                    _b.sent();
                                    return [4 /*yield*/, vesting.read.total([alice.account.address])];
                                case 9:
                                    aliceVesting = _b.sent();
                                    return [4 /*yield*/, vesting.read.total([bob.account.address])];
                                case 10:
                                    bobVesting = _b.sent();
                                    chai_1.expect(aliceVesting).to.equal(viem_1.parseEther("950")); // 1000 - 50 (claimed)
                                    chai_1.expect(bobVesting).to.equal(viem_1.parseEther("0"));
                                    // Ensure A can claim the transferred amount
                                    return [4 /*yield*/, network_helpers_1.time.increase(totalDuration)];
                                case 11:
                                    // Ensure A can claim the transferred amount
                                    _b.sent(); // Move to end of vesting period
                                    return [4 /*yield*/, vesting.write.claim({ account: alice.account })];
                                case 12:
                                    _b.sent();
                                    return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                                case 13:
                                    finalAliceBalance = _b.sent();
                                    chai_1.expect(finalAliceBalance).to.be.closeTo(viem_1.parseEther("1000"), viem_1.parseEther("0.1")); // Allow small rounding difference
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
