"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require("hardhat"),
    ethers = _require.ethers,
    upgrades = _require.upgrades;

function main() {
  var _ref, _ref2, deployer, SecondSwapMarketplace, marketplace;

  return regeneratorRuntime.async(function main$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(ethers.getSigners());

        case 2:
          _ref = _context.sent;
          _ref2 = _slicedToArray(_ref, 1);
          deployer = _ref2[0];
          console.log("Deploying contracts with the account:", deployer.address); //   // Deploy VestingManager (assuming it's already deployed)
          //   const VestingManager = await ethers.getContractFactory("VestingManager");
          //   const vestingManager = await VestingManager.deploy();
          //   // Deploy WhitelistDeployer (assuming it's already deployed)
          //   const WhitelistDeployer = await ethers.getContractFactory("WhitelistDeployer");
          //   const whitelistDeployer = await WhitelistDeployer.deploy();
          //   // Deploy USDT (mock for testing)
          //   const MockUSDT = await ethers.getContractFactory("MockUSDT");
          //   const usdt = await MockUSDT.deploy();
          // Deploy the implementation contract

          _context.next = 8;
          return regeneratorRuntime.awrap(ethers.getContractFactory("SecondSwap_MarketplaceProxyTest"));

        case 8:
          SecondSwapMarketplace = _context.sent;
          _context.next = 11;
          return regeneratorRuntime.awrap(upgrades.deployProxy(SecondSwapMarketplace, ["0x9DAd21f55dE4ac53AD97B191089639AC97Bf3a85", "0x0F613eE4E8c8edC695B9fbCDe4e4Ae8F950Efe4D", "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5", // s2Admin
          "0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5", // s2Dev
          "0x89Aad8E9d593F1879bCC4e59C06C6892ff9cD0f3"], {
            initializer: 'initialize'
          }));

        case 11:
          marketplace = _context.sent;
          _context.next = 14;
          return regeneratorRuntime.awrap(marketplace.deployed());

        case 14:
          console.log("SecondSwapMarketplace deployed to:", marketplace.address);
          _context.t0 = console;
          _context.next = 18;
          return regeneratorRuntime.awrap(upgrades.erc1967.getImplementationAddress(marketplace.address));

        case 18:
          _context.t1 = _context.sent;

          _context.t0.log.call(_context.t0, "Implementation address:", _context.t1);

          _context.t2 = console;
          _context.next = 23;
          return regeneratorRuntime.awrap(upgrades.erc1967.getAdminAddress(marketplace.address));

        case 23:
          _context.t3 = _context.sent;

          _context.t2.log.call(_context.t2, "ProxyAdmin address:", _context.t3);

        case 25:
        case "end":
          return _context.stop();
      }
    }
  });
}

main().then(function () {
  return process.exit(0);
})["catch"](function (error) {
  console.error(error);
  process.exit(1);
});