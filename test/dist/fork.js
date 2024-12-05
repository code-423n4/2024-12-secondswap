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
var viem_1 = require("viem"); // Ensure viem is installed for ethers formatting
var network_helpers_1 = require("@nomicfoundation/hardhat-toolbox-viem/network-helpers"); // Hardhat viem helpers
describe("Fork", function () {
    var s2admin, s2dev;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, hardhat_1.ethers.getSigners()];
                    case 1:
                        _a = _b.sent(), s2admin = _a[0], s2dev = _a[1];
                        return [2 /*return*/];
                }
            });
        });
    });
    var msg_sender = "0x477a8F88a52E685FA8d0dFd02Ea047983e04990A";
    var vesting = "0x03a0A66cecc1a4D06fF2b7D0b5f32E1ec55EfEE0";
    var _amount = viem_1.parseEther("100");
    var _cost = viem_1.parseEther("10");
    var _discountpct = 0;
    var _listingtype = 1;
    var _discounttype = 0;
    var _whitelist = "0x0000000000000000000000000000000000000000";
    var name = "Test Token";
    var symbol = "TT";
    var initialSupply = viem_1.parseEther("1000000");
    it("Test List Vesting", function () {
        return __awaiter(this, void 0, void 0, function () {
            var vManager, marketplace, impersonateMsgSender;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hardhat_1["default"].ethers.getContractAt("SecondSwap_VestingManager", "0xd6C766bBc032c4fD16CbDFF2a0B36b039EA49155")];
                    case 1:
                        vManager = _a.sent();
                        return [4 /*yield*/, hardhat_1["default"].ethers.getContractAt("SecondSwap_Marketplace", "0x6426eB27F30c0f4e4bBFAe9a5390B803d50eCF64")];
                    case 2:
                        marketplace = _a.sent();
                        return [4 /*yield*/, network_helpers_1.impersonateAccount(msg_sender)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, hardhat_1.ethers.getSigner(msg_sender)];
                    case 4:
                        impersonateMsgSender = _a.sent();
                        return [4 /*yield*/, marketplace.connect(impersonateMsgSender).listVesting(vesting, _amount, _cost, _discountpct, _listingtype, _discounttype, _whitelist)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
});
