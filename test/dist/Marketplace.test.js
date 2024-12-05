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
var viem_1 = require("viem"); // Ensure viem is installed for ethers formatting
var network_helpers_1 = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers"); // Hardhat viem helpers
var SetMarketplaceSettings_1 = require("../ignition/modules/SetMarketplaceSettings");
describe("SecondSwap Marketplace", function () {
    function deployMarketplaceFixture() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, owner, tokenOwner, alice, bob, s2admin, s2dev, whitelistDeployer, startTime, _b, endTime, steps, Marketplace;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                    case 1:
                        _a = _c.sent(), owner = _a[0], tokenOwner = _a[1], alice = _a[2], bob = _a[3], s2admin = _a[4], s2dev = _a[5], whitelistDeployer = _a[6];
                        _b = BigInt;
                        return [4 /*yield*/, network_helpers_1.time.latest()];
                    case 2:
                        startTime = _b.apply(void 0, [_c.sent()]);
                        endTime = startTime + BigInt(60 * 60 * 24 * 1000);
                        steps = BigInt(200);
                        return [4 /*yield*/, hardhat_1["default"].ignition.deploy(SetMarketplaceSettings_1["default"], {
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
                                    },
                                    DeployMarketplace: {
                                        s2admin: s2admin.account.address,
                                        s2dev: s2dev.account.address
                                    }
                                }
                            })];
                    case 3:
                        Marketplace = _c.sent();
                        return [4 /*yield*/, Marketplace.manager.write.setMarketplace([Marketplace.marketplace.address])];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, Marketplace.token.write.transfer([tokenOwner.account.address, viem_1.parseEther("1000000")])];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, Marketplace.token.write.approve([Marketplace.vesting.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                    case 6:
                        _c.sent();
                        return [4 /*yield*/, Marketplace.vesting.write.createVesting([alice.account.address, viem_1.parseEther("1000")], { account: tokenOwner.account })];
                    case 7:
                        _c.sent();
                        return [4 /*yield*/, Marketplace.manager.write.setDev([s2admin.account.address])];
                    case 8:
                        _c.sent();
                        return [4 /*yield*/, Marketplace.manager.write.setSellable([Marketplace.vesting.address, true], { account: s2admin.account })];
                    case 9:
                        _c.sent();
                        // await Marketplace.manager.write.setMaxSellPercent([Marketplace.vesting.address,BigInt(2000)],{account: s2admin.account});
                        // await Marketplace.manager.
                        return [2 /*return*/, {
                                vesting: Marketplace.vesting,
                                token: Marketplace.token,
                                owner: owner,
                                tokenOwner: tokenOwner,
                                alice: alice,
                                bob: bob,
                                startTime: startTime,
                                endTime: endTime,
                                steps: steps,
                                manager: Marketplace.manager,
                                marketplace: Marketplace.marketplace
                            }];
                }
            });
        });
    }
    describe("Deployment", function () {
        it("should deploy successfully", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, owner, endTime, steps, marketplace, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, owner = _a.owner, endTime = _a.endTime, steps = _a.steps, marketplace = _a.marketplace;
                            chai_1.expect(vesting.address).to.not.equal(0);
                            chai_1.expect(token.address).to.not.equal(0);
                            chai_1.expect(marketplace.address).to.not.equal(0);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _b.sent();
                            console.error("Deployment test failed:", error_1);
                            throw error_1; // Re-throw to fail the test
                        case 3: return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Public Vesting Listings", function () {
        it("List vesting with single fill, no discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, updatedSettings, amount, cost, discountPct, discountType, listingType, maxWhitelist, privateListing, currency, listing, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 2:
                            updatedSettings = _b.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            amount = viem_1.parseEther("10");
                            cost = viem_1.parseEther("100");
                            discountPct = BigInt(0);
                            discountType = 0;
                            listingType = 0;
                            maxWhitelist = 0;
                            privateListing = false;
                            currency = token.address;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 6, , 7]);
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _b.sent();
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Check if address tally
                            chai_1.expect(listing[1]).to.equal(amount); // Check if the total and the amount listed tally
                            chai_1.expect(listing[3]).to.equal(cost); // Check if the price per unit tally
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Check if listing is active
                            return [3 /*break*/, 7];
                        case 6:
                            error_2 = _b.sent();
                            throw error_2; // Rethrow the error to fail the test
                        case 7: return [2 /*return*/];
                    }
                });
            });
        });
        it("List vesting with single fill, linear discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, listing;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("200"), BigInt(20), 1, 1, BigInt(0), token.address, false], { account: alice.account })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 4:
                            listing = _b.sent();
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Seller address check
                            chai_1.expect(listing[3]).to.equal(viem_1.parseEther("200")); // Price per unit
                            chai_1.expect(listing[5]).to.equal(1); // Discount type
                            chai_1.expect(listing[6]).to.equal(BigInt(20)); // Discount percentage
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[10]).to.equal(token.address); // Whitelist address
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("List vesting with partial fill, and amount more than allocated amount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("1000"), viem_1.parseEther("200"), BigInt(20), 1, 1, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            error_3 = _b.sent();
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        });
        // TODO To test (After the user lists the lot, can the lot be transferred? The lot should not be transferable once the lot is listed on the marketplace)
        // it("Cannot transfer vesting tokens once listed on marketplace", async function () {
        //     const { 
        //         vesting, 
        //         token, 
        //         alice, 
        //         bob, 
        //         marketplace, 
        //         manager,
        //         owner,
        //         s2admin,
        //         s2dev
        //     } = await loadFixture(deployMarketplaceFixture);
        //     // First list the vesting tokens
        //     const amount = parseEther("100");
        //     const cost = parseEther("200");
        //     const discountPct = BigInt(0);
        //     const listingType = BigInt(0);
        //     const discountType = BigInt(0);
        //     const nullAddress = "0x0000000000000000000000000000000000000000";
        //     // Approve and list the tokens
        //     await token.write.approve([marketplace.address, parseEther("1000")], { account: alice.account });
        //     await marketplace.write.listVesting(
        //         [vesting.address, amount, cost, discountPct, listingType, discountType, nullAddress],
        //         { account: alice.account }
        //     );
        //     // Verify listing was successful
        //     const listing = await marketplace.read.listings([vesting.address, 0]);
        //     expect(listing[0].toLowerCase()).to.equal(alice.account.address.toLowerCase());
        //     expect(listing[9]).to.be.true; // Check if listing is active
        //     // Test transfer attempts from different roles
        //     // Try with contract owner
        //     try {
        //         await vesting.write.transferVesting(
        //             [alice.account.address, bob.account.address, amount],
        //             { account: owner.account }
        //         );
        //         expect.fail("Transfer should have been reverted for listed tokens");
        //     } catch (error) {
        //         expect(error.message).to.include("cannot transfer listed tokens");
        //     }
        //     // Try with s2admin
        //     try {
        //         await vesting.write.transferVesting(
        //             [alice.account.address, bob.account.address, amount],
        //             { account: s2admin.account }
        //         );
        //         expect.fail("Transfer should have been reverted for listed tokens");
        //     } catch (error) {
        //         expect(error.message).to.include("cannot transfer listed tokens");
        //     }
        //     // Try with s2dev
        //     try {
        //         await vesting.write.transferVesting(
        //             [alice.account.address, bob.account.address, amount],
        //             { account: s2dev.account }
        //         );
        //         expect.fail("Transfer should have been reverted for listed tokens");
        //     } catch (error) {
        //         expect(error.message).to.include("cannot transfer listed tokens");
        //     }
        //     // Try with unauthorized address (bob)
        //     try {
        //         await vesting.write.transferVesting(
        //             [alice.account.address, bob.account.address, amount],
        //             { account: bob.account }
        //         );
        //         expect.fail("Transfer should have been reverted for unauthorized caller");
        //     } catch (error) {
        //         expect(error.message).to.include("unauthorized");
        //     }
        //     // Verify alice still has their vesting tokens
        //     const aliceVesting = await vesting.read.vesting([alice.account.address]);
        //     expect(aliceVesting.).to.equal(parseEther("1000")); // Initial amount from fixture
        //     // Verify listing is still active
        //     const listingAfterTests = await marketplace.read.listings([vesting.address, 0]);
        //     expect(listingAfterTests[9]).to.be.true;
        // });
    });
    describe("Public Vesting Delistings", function () {
        it("Unlist all token from lot after the penalty period", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, marketplace, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, duration, currency, listing, unlist;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, marketplace = _a.marketplace;
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("200");
                            discountPct = BigInt(20);
                            listingType = 1;
                            discountType = 1;
                            maxWhitelist = 0;
                            privateListing = false;
                            duration = 60 * 60 * 24 * 365;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.setMinListingDuration([BigInt(60 * 60 * 24)])];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, network_helpers_1.time.increase(duration)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 6:
                            listing = _b.sent();
                            return [4 /*yield*/, marketplace.write.unlistVesting([vesting.address, 0, listing[1]], { account: alice.account })];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 8:
                            unlist = _b.sent();
                            chai_1.expect(unlist[0].toLocaleLowerCase()).to.equal(alice.account.address); // Seller address check
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Check if listing is active
                            chai_1.expect(unlist[10]).to.equal(token.address); // Whitelist address
                            chai_1.expect(unlist[9]).to.equal(2); // Check lot status
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Unlist all token from lot before the penalty period with insufficient fund", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, marketplace, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, listing, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, marketplace = _a.marketplace;
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("200");
                            discountPct = BigInt(20);
                            listingType = 1;
                            discountType = 1;
                            maxWhitelist = 0;
                            privateListing = false;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.setMinListingDuration([BigInt(60 * 60 * 24)])
                                // await time.increase(duration);
                            ];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _b.sent();
                            _b.label = 6;
                        case 6:
                            _b.trys.push([6, 8, , 9]);
                            return [4 /*yield*/, chai_1.expect(marketplace.write.unlistVesting([vesting.address, 0, listing[1]], { account: alice.account })).to.be.reverted];
                        case 7:
                            _b.sent();
                            return [3 /*break*/, 9];
                        case 8:
                            error_4 = _b.sent();
                            return [3 /*break*/, 9];
                        case 9:
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Seller address check
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Listing should still be active
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Unlist all token from lot before the penalty period with sufficient fund", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, marketplace, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, listing, unlist;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _b.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, marketplace = _a.marketplace;
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("200");
                            discountPct = BigInt(20);
                            listingType = 1;
                            discountType = 1;
                            maxWhitelist = 0;
                            privateListing = false;
                            currency = token.address;
                            return [4 /*yield*/, token.write.mint([alice.account.address, viem_1.parseEther("1000")])];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.setMinListingDuration([BigInt(60 * 60 * 24)])];
                        case 4:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _b.sent();
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 6:
                            _b.sent();
                            return [4 /*yield*/, marketplace.write.unlistVesting([vesting.address, 0, listing[1]], { account: alice.account })];
                        case 7:
                            _b.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 8:
                            unlist = _b.sent();
                            chai_1.expect(unlist[0].toLocaleLowerCase()).to.equal(alice.account.address); // Seller address check
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(unlist[9]).to.equal(2); // Check lot status
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Private Vesting Listing", function () {
        // TODO private listing with single fill, no discount and 3 whitelist address
        it("private listing with single fill, no discount and 3 whitelist address", function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var _b, vesting, token, alice, marketplace, _c, user1, user2, user3, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, tx, publicClient, receipt, whitelistCreatedEvent, decodedLog, listing, whitelistAddress, whitelistContract, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                return __generator(this, function (_o) {
                    switch (_o.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _b = _o.sent(), vesting = _b.vesting, token = _b.token, alice = _b.alice, marketplace = _b.marketplace;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _c = _o.sent(), user1 = _c[0], user2 = _c[1], user3 = _c[2];
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("75");
                            discountPct = BigInt(10);
                            listingType = 0;
                            discountType = 2;
                            maxWhitelist = 3;
                            privateListing = true;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 3:
                            _o.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 4:
                            tx = _o.sent();
                            return [4 /*yield*/, hardhat_1["default"].viem.getPublicClient()];
                        case 5:
                            publicClient = _o.sent();
                            return [4 /*yield*/, publicClient.waitForTransactionReceipt({ hash: tx })];
                        case 6:
                            receipt = _o.sent();
                            whitelistCreatedEvent = receipt.logs.find(function (log) {
                                var eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
                                var eventTopic = viem_1.keccak256(viem_1.toHex(eventSignature));
                                return log.topics[0] === eventTopic;
                            });
                            chai_1.expect(whitelistCreatedEvent).to.not.be.undefined;
                            if (!whitelistCreatedEvent) return [3 /*break*/, 23];
                            decodedLog = viem_1.decodeEventLog({
                                abi: marketplace.abi,
                                data: whitelistCreatedEvent.data,
                                topics: whitelistCreatedEvent.topics
                            });
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 7:
                            listing = _o.sent();
                            chai_1.expect(listing[0].toLowerCase()).to.equal(alice.account.address.toLowerCase()); // Seller address check
                            chai_1.expect(listing[6]).to.equal(discountPct); // Discount percentage
                            whitelistAddress = (_a = decodedLog.args) === null || _a === void 0 ? void 0 : _a.whitelistAddress;
                            if (!whitelistAddress) return [3 /*break*/, 21];
                            return [4 /*yield*/, hardhat_1["default"].viem.getContractAt("SecondSwap_WhitelistContract", listing[8])];
                        case 8:
                            whitelistContract = _o.sent();
                            _d = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user1.account.address], { account: user1.account.address })];
                        case 9:
                            _d.apply(void 0, [_o.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user1.account.address })];
                        case 10:
                            _o.sent();
                            _e = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 11:
                            _e.apply(void 0, [_o.sent()]).to.equal(BigInt(2));
                            _f = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user1.account.address], { account: user1.account.address })];
                        case 12:
                            _f.apply(void 0, [_o.sent()]).to.equal(true);
                            _g = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user2.account.address], { account: user2.account.address })];
                        case 13:
                            _g.apply(void 0, [_o.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user2.account.address })];
                        case 14:
                            _o.sent();
                            _h = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 15:
                            _h.apply(void 0, [_o.sent()]).to.equal(BigInt(1));
                            _j = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user2.account.address], { account: user2.account.address })];
                        case 16:
                            _j.apply(void 0, [_o.sent()]).to.equal(true);
                            _k = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user3.account.address], { account: user3.account.address })];
                        case 17:
                            _k.apply(void 0, [_o.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user3.account.address })];
                        case 18:
                            _o.sent();
                            _l = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 19:
                            _l.apply(void 0, [_o.sent()]).to.equal(BigInt(0));
                            _m = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user3.account.address], { account: user3.account.address })];
                        case 20:
                            _m.apply(void 0, [_o.sent()]).to.equal(true);
                            chai_1.expect(listing[8].toLowerCase()).to.equal(whitelistAddress.toLowerCase()); // Whitelist address check
                            return [3 /*break*/, 22];
                        case 21:
                            console.warn('WhitelistAddress not found in the decoded log');
                            _o.label = 22;
                        case 22:
                            chai_1.expect(listing[9]).to.equal(0); // Listing is active
                            _o.label = 23;
                        case 23: return [2 /*return*/];
                    }
                });
            });
        });
        // TODO private listing, single fill, fixed discount
        it("private listing, single fill, fixed discount", function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var _b, vesting, token, alice, marketplace, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, tx, publicClient, receipt, whitelistCreatedEvent, decodedLog, listing, whitelistAddress;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _b = _c.sent(), vesting = _b.vesting, token = _b.token, alice = _b.alice, marketplace = _b.marketplace;
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("75");
                            discountPct = BigInt(10);
                            listingType = 0;
                            discountType = 2;
                            maxWhitelist = 10;
                            privateListing = true;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 3:
                            tx = _c.sent();
                            return [4 /*yield*/, hardhat_1["default"].viem.getPublicClient()];
                        case 4:
                            publicClient = _c.sent();
                            return [4 /*yield*/, publicClient.waitForTransactionReceipt({ hash: tx })];
                        case 5:
                            receipt = _c.sent();
                            whitelistCreatedEvent = receipt.logs.find(function (log) {
                                var eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
                                var eventTopic = viem_1.keccak256(viem_1.toHex(eventSignature));
                                return log.topics[0] === eventTopic;
                            });
                            chai_1.expect(whitelistCreatedEvent).to.not.be.undefined;
                            if (!whitelistCreatedEvent) return [3 /*break*/, 7];
                            decodedLog = viem_1.decodeEventLog({
                                abi: marketplace.abi,
                                data: whitelistCreatedEvent.data,
                                topics: whitelistCreatedEvent.topics
                            });
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 6:
                            listing = _c.sent();
                            chai_1.expect(listing[0].toLowerCase()).to.equal(alice.account.address.toLowerCase()); // Seller address check
                            chai_1.expect(listing[6]).to.equal(discountPct); // Discount percentage
                            whitelistAddress = (_a = decodedLog.args) === null || _a === void 0 ? void 0 : _a.whitelistAddress;
                            if (whitelistAddress) {
                                chai_1.expect(listing[8].toLowerCase()).to.equal(whitelistAddress.toLowerCase()); // Whitelist address check
                            }
                            else {
                                console.warn('WhitelistAddress not found in the decoded log');
                            }
                            chai_1.expect(listing[9]).to.equal(0); // Listing is active
                            _c.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        });
        // TODO private listing with partial fill, with discount and 0 whitelist address (throw error)
        it("private listing with partial fill, with discount and 0 whitelist address (throw error)", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, marketplace, _b, user1, user2, user3, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, _c, error_5;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _d.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, marketplace = _a.marketplace;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _d.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2];
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("75");
                            discountPct = BigInt(10);
                            listingType = 0;
                            discountType = 2;
                            maxWhitelist = 0;
                            privateListing = true;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 3:
                            _d.sent();
                            _d.label = 4;
                        case 4:
                            _d.trys.push([4, 6, , 7]);
                            _c = chai_1.expect;
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 5:
                            _c.apply(void 0, [_d.sent()]).to.be.revertedWith("SecondSwap_Marketplace: Minimum whitelist user cannot be 0");
                            return [3 /*break*/, 7];
                        case 6:
                            error_5 = _d.sent();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        });
        // TODO private listing with partial fill, with no discount and 3 whitelist address and 4 user whitelist (should throw error)
        it("private listing with partial fill, with discount and 3 whitelist address and 4 user whitelist (throw error)", function () {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var _b, vesting, token, alice, marketplace, _c, user1, user2, user3, user4, amount, cost, discountPct, listingType, discountType, maxWhitelist, privateListing, currency, tx, publicClient, receipt, whitelistCreatedEvent, decodedLog, listing, whitelistAddress, whitelistContract, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, error_6;
                return __generator(this, function (_r) {
                    switch (_r.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _b = _r.sent(), vesting = _b.vesting, token = _b.token, alice = _b.alice, marketplace = _b.marketplace;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _c = _r.sent(), user1 = _c[0], user2 = _c[1], user3 = _c[2], user4 = _c[3];
                            amount = viem_1.parseEther("100");
                            cost = viem_1.parseEther("75");
                            discountPct = BigInt(10);
                            listingType = 0;
                            discountType = 2;
                            maxWhitelist = 3;
                            privateListing = true;
                            currency = token.address;
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("1000")], { account: alice.account })];
                        case 3:
                            _r.sent();
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, privateListing], { account: alice.account })];
                        case 4:
                            tx = _r.sent();
                            return [4 /*yield*/, hardhat_1["default"].viem.getPublicClient()];
                        case 5:
                            publicClient = _r.sent();
                            return [4 /*yield*/, publicClient.waitForTransactionReceipt({ hash: tx })];
                        case 6:
                            receipt = _r.sent();
                            whitelistCreatedEvent = receipt.logs.find(function (log) {
                                var eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
                                var eventTopic = viem_1.keccak256(viem_1.toHex(eventSignature));
                                return log.topics[0] === eventTopic;
                            });
                            chai_1.expect(whitelistCreatedEvent).to.not.be.undefined;
                            if (!whitelistCreatedEvent) return [3 /*break*/, 28];
                            decodedLog = viem_1.decodeEventLog({
                                abi: marketplace.abi,
                                data: whitelistCreatedEvent.data,
                                topics: whitelistCreatedEvent.topics
                            });
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 7:
                            listing = _r.sent();
                            chai_1.expect(listing[0].toLowerCase()).to.equal(alice.account.address.toLowerCase()); // Seller address check
                            chai_1.expect(listing[6]).to.equal(discountPct); // Discount percentage
                            whitelistAddress = (_a = decodedLog.args) === null || _a === void 0 ? void 0 : _a.whitelistAddress;
                            if (!whitelistAddress) return [3 /*break*/, 27];
                            return [4 /*yield*/, hardhat_1["default"].viem.getContractAt("SecondSwap_WhitelistContract", listing[8])];
                        case 8:
                            whitelistContract = _r.sent();
                            _d = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user1.account.address], { account: user1.account.address })];
                        case 9:
                            _d.apply(void 0, [_r.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user1.account.address })];
                        case 10:
                            _r.sent();
                            _e = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 11:
                            _e.apply(void 0, [_r.sent()]).to.equal(BigInt(2));
                            _f = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user1.account.address], { account: user1.account.address })];
                        case 12:
                            _f.apply(void 0, [_r.sent()]).to.equal(true);
                            _g = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user2.account.address], { account: user2.account.address })];
                        case 13:
                            _g.apply(void 0, [_r.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user2.account.address })];
                        case 14:
                            _r.sent();
                            _h = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 15:
                            _h.apply(void 0, [_r.sent()]).to.equal(BigInt(1));
                            _j = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user2.account.address], { account: user2.account.address })];
                        case 16:
                            _j.apply(void 0, [_r.sent()]).to.equal(true);
                            _k = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user3.account.address], { account: user3.account.address })];
                        case 17:
                            _k.apply(void 0, [_r.sent()]).to.equal(false);
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user3.account.address })];
                        case 18:
                            _r.sent();
                            _l = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.balanceWhitelist()];
                        case 19:
                            _l.apply(void 0, [_r.sent()]).to.equal(BigInt(0));
                            _m = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user3.account.address], { account: user3.account.address })];
                        case 20:
                            _m.apply(void 0, [_r.sent()]).to.equal(true);
                            _r.label = 21;
                        case 21:
                            _r.trys.push([21, 25, , 26]);
                            _o = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user4.account.address], { account: user4.account.address })];
                        case 22:
                            _o.apply(void 0, [_r.sent()]).to.equal(false);
                            _p = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.write.whitelistAddress({ account: user4.account.address })];
                        case 23:
                            _p.apply(void 0, [_r.sent()]).to.be.revertedWith("SecondSwap_Whitelist: Reached whitelist limit");
                            ;
                            _q = chai_1.expect;
                            return [4 /*yield*/, whitelistContract.read.validateAddress([user3.account.address], { account: user3.account.address })];
                        case 24:
                            _q.apply(void 0, [_r.sent()]).to.equal(false);
                            return [3 /*break*/, 26];
                        case 25:
                            error_6 = _r.sent();
                            return [3 /*break*/, 26];
                        case 26:
                            chai_1.expect(listing[8].toLowerCase()).to.equal(whitelistAddress.toLowerCase()); // Whitelist address check
                            chai_1.expect(listing[9]).to.equal(0); // Listing is active
                            return [3 /*break*/, 28];
                        case 27:
                            console.warn('WhitelistAddress not found in the decoded log');
                            _r.label = 28;
                        case 28: return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Purchase Lot", function () {
        // TODO Purchase Public Lot, Single Fill with all the correct balance no discount
        it("Purchase Public Lot, Single Fill with all the correct balance no discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user1Balance, totalPrice, totalReceiver, aliceBalance;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(0), 1, 0, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Check if address tally
                            chai_1.expect(listing[1]).to.equal(viem_1.parseEther("100")); // Check if the total and the amount listed tally
                            chai_1.expect(listing[3]).to.equal(viem_1.parseEther("100")); // Check if the price per unit tally
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Check if listing is active               
                            chai_1.expect(listing[10]).to.equal(token.address);
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000")])
                                // approve
                            ]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            // approve
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            // approve
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("100"), "0x0000000000000000000000000000000000000000"], { account: user1.account })];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 9:
                            user1Data = _c.sent();
                            return [4 /*yield*/, token.read.balanceOf([user1.account.address])];
                        case 10:
                            user1Balance = _c.sent();
                            totalPrice = 100000 - (((100 * 100) * 102.5) / 100);
                            chai_1.expect(viem_1.formatEther(user1Balance)).to.equal(totalPrice.toString());
                            totalReceiver = (((100 * 100) * 97.5) / 100);
                            return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                        case 11:
                            aliceBalance = _c.sent();
                            chai_1.expect(viem_1.formatEther(aliceBalance)).to.equal(totalReceiver.toString());
                            chai_1.expect(user1Data[0]).to.equal(viem_1.parseEther("100"));
                            chai_1.expect(user1Data[1]).to.equal(viem_1.parseEther("0"));
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with discount  
        it("Purchase Public Lot, Single Fill with discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user1Balance, totalPrice, totalReceiver, aliceBalance;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(2000), 1, 2, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Check if address tally
                            chai_1.expect(listing[1]).to.equal(viem_1.parseEther("100")); // Check if the total and the amount listed tally
                            chai_1.expect(listing[3]).to.equal(viem_1.parseEther("100")); // Check if the price per unit tally
                            chai_1.expect(listing[5]).to.equal(2); // Check if the price per unit tally
                            chai_1.expect(listing[6]).to.equal(BigInt(2000)); // Check if the price per unit tally
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Check if listing is active               
                            chai_1.expect(listing[10]).to.equal(token.address);
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000000")])
                                // approve
                            ]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            // approve
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            // approve
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("100"), "0x0000000000000000000000000000000000000000"], { account: user1.account })];
                        case 8:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 9:
                            user1Data = _c.sent();
                            return [4 /*yield*/, token.read.balanceOf([user1.account.address])];
                        case 10:
                            user1Balance = _c.sent();
                            totalPrice = 100000000 - ((((100 * 100) * 0.8) * 102.5) / 100);
                            chai_1.expect(viem_1.formatEther(user1Balance)).to.equal(totalPrice.toString());
                            totalReceiver = ((((100 * 100) * 0.8) * 97.5) / 100);
                            return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                        case 11:
                            aliceBalance = _c.sent();
                            chai_1.expect(viem_1.formatEther(aliceBalance)).to.equal(totalReceiver.toString());
                            chai_1.expect(user1Data[0]).to.equal(viem_1.parseEther("100"));
                            chai_1.expect(user1Data[1]).to.equal(viem_1.parseEther("0"));
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with discount  
        it("Purchase Public Lot, Partial Fill with no discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user2Data, listingAB, aliceData, u1balance, u2balance, alicebalance, u1Price;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(0), 0, 0, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            chai_1.expect(listing[0].toLocaleLowerCase()).to.equal(alice.account.address); // Check if address tally
                            chai_1.expect(listing[1]).to.equal(viem_1.parseEther("100")); // Check if the total and the amount listed tally
                            chai_1.expect(listing[3]).to.equal(viem_1.parseEther("100")); // Check if the price per unit tally
                            chai_1.expect(listing[5]).to.equal(0); // Discount tyep
                            chai_1.expect(listing[6]).to.equal(BigInt(0)); // Check if the price per unit tally
                            chai_1.expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
                            chai_1.expect(listing[9]).to.equal(0); // Check if listing is active               
                            chai_1.expect(listing[10]).to.equal(token.address);
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user2.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 8:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user2.account })];
                        case 9:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("10"), "0x0000000000000000000000000000000000000000"], { account: user1.account })];
                        case 10:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("10"), "0x0000000000000000000000000000000000000000"], { account: user2.account })];
                        case 11:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 12:
                            user1Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user2.account.address, vesting.address])];
                        case 13:
                            user2Data = _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 14:
                            listingAB = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([alice.account.address, vesting.address])];
                        case 15:
                            aliceData = _c.sent();
                            return [4 /*yield*/, token.read.balanceOf([user1.account.address])];
                        case 16:
                            u1balance = (_c.sent());
                            return [4 /*yield*/, token.read.balanceOf([user2.account.address])];
                        case 17:
                            u2balance = (_c.sent());
                            return [4 /*yield*/, token.read.balanceOf([alice.account.address])];
                        case 18:
                            alicebalance = (_c.sent());
                            u1Price = (10 * 100) + 1 * 0.025;
                            chai_1.expect(user1Data[0]).to.equal(viem_1.parseEther("10")); //Amount Bought
                            chai_1.expect(user1Data[1]).to.equal(viem_1.parseEther("0"));
                            chai_1.expect(user2Data[0]).to.equal(viem_1.parseEther("10"));
                            chai_1.expect(user2Data[1]).to.equal(viem_1.parseEther("0"));
                            // Listing amount got minus
                            chai_1.expect(listingAB[2]).to.equal(viem_1.parseEther("80"));
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with discount  
        it("Purchase Public Lot, Partial Fill with Linear discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user2Data, user3Data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(2000), 0, 1, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user2.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 8:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user2.account })];
                        case 9:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user3.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 10:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user3.account })];
                        case 11:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("50"), "0x0000000000000000000000000000000000000000"], { account: user1.account })];
                        case 12:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("10"), "0x0000000000000000000000000000000000000000"], { account: user3.account })];
                        case 13:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user2.account })];
                        case 14:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user3.account })
                                // TODO continue checking the logic of linear discount
                            ];
                        case 15:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 16:
                            user1Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user2.account.address, vesting.address])];
                        case 17:
                            user2Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user3.account.address, vesting.address])];
                        case 18:
                            user3Data = _c.sent();
                            console.log(user1Data);
                            console.log(user2Data);
                            console.log(user3Data);
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with discount  
        it("Purchase Public Lot, Partial Fill with Linear discount With Referral", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user2Data, user3Data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(2000), 0, 1, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user2.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 8:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user2.account })];
                        case 9:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user3.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 10:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user3.account })];
                        case 11:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("50"), user2.account.address], { account: user1.account })];
                        case 12:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("10"), user2.account.address], { account: user3.account })];
                        case 13:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user2.account })];
                        case 14:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user3.account })
                                // TODO continue checking the logic of linear discount
                            ];
                        case 15:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 16:
                            user1Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user2.account.address, vesting.address])];
                        case 17:
                            user2Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user3.account.address, vesting.address])];
                        case 18:
                            user3Data = _c.sent();
                            console.log(user1Data);
                            console.log(user2Data);
                            console.log(user3Data);
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with discount  
        it("Purchase Private Lot, Single Fill with Single discount", function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a, vesting, token, alice, manager, marketplace, startTime, tokenOwner, _b, user1, user2, user3, user4, updatedSettings, listing, user1Data, user2Data, user3Data;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, network_helpers_1.loadFixture(deployMarketplaceFixture)];
                        case 1:
                            _a = _c.sent(), vesting = _a.vesting, token = _a.token, alice = _a.alice, manager = _a.manager, marketplace = _a.marketplace, startTime = _a.startTime, tokenOwner = _a.tokenOwner;
                            return [4 /*yield*/, hardhat_1["default"].viem.getWalletClients()];
                        case 2:
                            _b = _c.sent(), user1 = _b[0], user2 = _b[1], user3 = _b[2], user4 = _b[3];
                            return [4 /*yield*/, manager.read.vestingSettings([vesting.address])];
                        case 3:
                            updatedSettings = _c.sent();
                            chai_1.expect(updatedSettings[0]).to.be["true"]; // Check if sellable is true
                            // List vesting
                            return [4 /*yield*/, marketplace.write.listVesting([vesting.address, viem_1.parseEther("100"), viem_1.parseEther("100"), BigInt(2000), 0, 1, BigInt(0), token.address, false], { account: alice.account })];
                        case 4:
                            // List vesting
                            _c.sent();
                            return [4 /*yield*/, marketplace.read.listings([vesting.address, 0])];
                        case 5:
                            listing = _c.sent();
                            return [4 /*yield*/, token.write.mint([user1.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 6:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user1.account })];
                        case 7:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user2.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 8:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user2.account })];
                        case 9:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, token.write.mint([user3.account.address, viem_1.parseEther("100000000")])]; //mint token
                        case 10:
                            _c.sent(); //mint token
                            return [4 /*yield*/, token.write.approve([marketplace.address, viem_1.parseEther("100000000")], { account: user3.account })];
                        case 11:
                            _c.sent(); // approve transaction
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("50"), user2.account.address], { account: user1.account })];
                        case 12:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("10"), user2.account.address], { account: user3.account })];
                        case 13:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user2.account })];
                        case 14:
                            _c.sent();
                            return [4 /*yield*/, marketplace.write.spotPurchase([vesting.address, 0, viem_1.parseEther("20"), "0x0000000000000000000000000000000000000000"], { account: user3.account })
                                // TODO continue checking the logic of linear discount
                            ];
                        case 15:
                            _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user1.account.address, vesting.address])];
                        case 16:
                            user1Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user2.account.address, vesting.address])];
                        case 17:
                            user2Data = _c.sent();
                            return [4 /*yield*/, manager.read.allocations([user3.account.address, vesting.address])];
                        case 18:
                            user3Data = _c.sent();
                            console.log(user1Data);
                            console.log(user2Data);
                            console.log(user3Data);
                            return [2 /*return*/];
                    }
                });
            });
        });
        // TODO Purchase Public Lot, Single Fill with all the correct balance fix discount
        // TODO Purchase Public Lot, Single Fill with the wrong amount fix discount
        // TODO Purchase Public Lot, Single Fill with insufficienst balance fix discount
        // TODO Purchase Public Lot, 50% with the correct balance no discount
        // TODO Purchase Public Lot, 50% with the insufficient balance no discount
        // TODO Purchase Public Lot, 50% with the correct balance fix discount
        // TODO Purchase Public Lot, 50% with the insufficient balance fix discount
        // TODO Purchase Public Lot, 50% with the correct balance linear discount
        // TODO Purchase Public Lot, 50% with the insufficient balance linear discount
        // TODO Purchase Public Lot, 100% with the correct balance no discount
        // TODO Purchase Public Lot, 100% with the insufficient balance no discount
        // TODO Purchase Public Lot, 100% with the correct balance fix discount
        // TODO Purchase Public Lot, 100% with the insufficient balance fix discount
        // TODO Purchase Public Lot, 100% with the correct balance linear discount
        // TODO Purchase Public Lot, 100% with the insufficient balance linear discount
        // TODO Purchase Public Lot, 105% with the correct balance no discount
        // TODO Purchase Public Lot, 105% with the insufficient balance no discount
        // TODO Purchase Public Lot, 105% with the correct balance fix discount
        // TODO Purchase Public Lot, 105% with the insufficient balance fix discount
        // TODO Purchase Public Lot, 105% with the correct balance linear discount
        // TODO Purchase Public Lot, 105% with the insufficient balance linear discount
        // TODO Purchase Public Lot, 50% with the correct balance no discount and change marketplace buyer fee
        // TODO Purchase Public Lot, 50% with the correct balance no discount and change marketplace seller fee
        // TODO Purchase Public Lot, 50% with the correct balance no discount and change vesting plan buyer and seller fee
    });
    // TODO create test script for purchasing vesting, check the balance of the seller and the buyer
    // TODO create test script for purchasing vesting with the multiple discount
    // TODO create test script for change fee collector address
    // TODO create test script for setting the fee
    // TODO create test script for checikg the duration
});
