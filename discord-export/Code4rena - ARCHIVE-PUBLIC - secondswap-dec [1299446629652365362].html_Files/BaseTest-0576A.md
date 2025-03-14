```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SecondSwap_WhitelistDeployer} from "src/SecondSwap_WhitelistDeployer.sol";
import {SecondSwap_VestingManager} from "src/SecondSwap_VestingManager.sol";
import {SecondSwap_Marketplace} from "src/SecondSwap_Marketplace.sol";
import {SecondSwap_StepVesting} from "src/SecondSwap_StepVesting.sol";
import {SecondSwap_MarketplaceSetting} from "src/SecondSwap_MarketplaceSetting.sol";
import {VestingDeployerMock} from "test/mocks/VestingDeployerMock.sol";
import {TestToken} from "src/TestToken.sol";
import {USDT} from "src/USDT.sol";
import {IVestingManager} from "src/interface/SecondSwap_IVestingManager.sol";

contract BaseTest is Test {
    TestToken public token;
    USDT public usdt;
    address public admin;
    address public tokenOwner;
    address public s2Admin;
    address public seller1;
    address public buyer1;
    SecondSwap_WhitelistDeployer public whitelistDeployer;
    SecondSwap_MarketplaceSetting public marketplaceSetting;
    SecondSwap_Marketplace public marketplace;
    address public vesting;
    VestingDeployerMock public vestingDeployer;
    SecondSwap_VestingManager public manager;
    uint256 constant intialSupply = 1_000_000 ether;
    uint256 constant initialAmount = 1_000 ether;

    function setUp() public virtual {
        admin = makeAddr("admin");
        tokenOwner = vm.addr(1);
        s2Admin = vm.addr(2);
        seller1 = vm.addr(3);
        buyer1 = vm.addr(4);
        address feeCollector = vm.addr(5);
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (60 * 60 * 24);
        uint256 steps = 200;

        /// Deploy TestToken contract
        token = new TestToken("Test Token", "TT", 1_000_000 * 10 ** 18, admin);
        assertTrue(address(token) != address(0));

        /// Deploy USDT
        usdt = new USDT();
        assertTrue(address(usdt) != address(0));

        /// Deploy WhitelistDeployer
        whitelistDeployer = new SecondSwap_WhitelistDeployer();

        /// Deploy VestingManager
        manager = new SecondSwap_VestingManager();
        manager.initialize(s2Admin);
        assertEq(manager.s2Admin(), s2Admin);

        /// Deploy VestingDeployerMock
        vestingDeployer = new VestingDeployerMock();
        vestingDeployer.initialize(s2Admin, address(manager));

        vm.startPrank(s2Admin);
        manager.setVestingDeployer(address(vestingDeployer));
        vestingDeployer.setTokenOwner(address(token), tokenOwner);
        vm.stopPrank();

        /// Deploy Vesting
        vm.startPrank(tokenOwner);
        vesting = vestingDeployer.deployVesting(
            address(token),
            startTime,
            endTime,
            steps,
            "Vesting01"
        );
        vm.stopPrank();
        console.log("vesting deployed");

        /// Deploy MarketplaceSetting
        marketplaceSetting = new SecondSwap_MarketplaceSetting(
            feeCollector,
            s2Admin,
            address(whitelistDeployer),
            address(manager),
            address(usdt)
        );
        assertEq(marketplaceSetting.buyerFee(), 250);
        assertEq(marketplaceSetting.sellerFee(), 250);
        assertEq(marketplaceSetting.penaltyFee(), 10 ether);

        /// Deploy Marketplace
        marketplace = new SecondSwap_Marketplace();
        marketplace.initialize(address(token), address(marketplaceSetting));
        assertEq(marketplace.version(), "1.0.0");

        vm.startPrank(admin);
        token.transfer(tokenOwner, intialSupply);
        vm.stopPrank();

        vm.startPrank(s2Admin);
        manager.setMarketplace(address(marketplace));
        vm.stopPrank();

        vm.startPrank(tokenOwner);
        token.approve(vesting, initialAmount);
        vestingDeployer.createVesting(seller1, initialAmount, vesting);
        vm.stopPrank();
    }

    function getListing(
        address _vestingPlan,
        uint256 listingId
    )
        public
        view
        returns (
            address seller,
            uint256 total,
            uint256 balance,
            uint256 pricePerUnit,
            SecondSwap_Marketplace.ListingType listingType,
            SecondSwap_Marketplace.DiscountType discountType,
            uint256 discountPct,
            uint256 listTime,
            address whitelist,
            uint256 minPurchaseAmt,
            SecondSwap_Marketplace.Status status,
            address currency,
            address vestingPlan
        )
    {
        (
            seller,
            total,
            balance,
            pricePerUnit,
            listingType,
            discountType,
            discountPct,
            listTime,
            whitelist,
            minPurchaseAmt,
            status,
            currency,
            vestingPlan
        ) = marketplace.listings(_vestingPlan, listingId);
    }
}
```
