# 2024-12-SecondSwap | Code4rena

Author: [y0ng0p3](https://code4rena.com/@y0ng0p3)

This a way of setting foundry up in the [SecondSwap](https://github.com/code-423n4/2024-12-secondswap/) C4 repo.

- Install OpenZeppelin foundry upgrade plugin

```sh
forge install OpenZeppelin/openzeppelin-foundry-upgrades --no-commit
```

- Update `foundry.toml`. Below is mine :

```solidity
[profile.default]
src = 'contracts'
out = 'out'
libs = ['node_modules', 'lib']
test = 'test'
cache_path  = 'cache_forge'
viaIR = true
ast = true
ffi = true
build_info = true
extra_output = ["storageLayout"]
fs_permissions = [
    { access = "read", path = "./"},
]
```

- Create a mock for `SecondSwap_VestingDeployer.sol`.

```solidity
/ SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../contracts/SecondSwap_StepVesting.sol";
import "../contracts/interface/SecondSwap_IVestingManager.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SecondSwap Vesting Deployer Contract
 * @notice Manages the deployment and configuration of vesting contracts
 * @dev Upgradeable contract that handles vesting contract deployment and management
 */
contract VestingDeployerMock is Initializable {
    /**
     * @notice Emitted when a new vesting contract is deployed
     * @param token Address of the token being vested
     * @param vesting Address of the deployed vesting contract
     * @param vestingId Unique identifier for the vesting contract
     */
    event VestingDeployed(address indexed token, address vesting, string vestingId);

    /**
     * @notice Emitted when a new vesting schedule is created
     * @param beneficiary Address receiving the vested tokens
     * @param totalAmount Amount of tokens being vested
     * @param stepVesting Address of the step vesting contract
     */
    event VestingCreated(address indexed beneficiary, uint256 totalAmount, address stepVesting);

    /**
     * @notice Emitted when vesting is transferred between addresses
     * @param grantor Address transferring the vesting
     * @param beneficiary Address receiving the vesting
     * @param amount Amount of tokens transferred
     * @param stepVesting Address of the step vesting contract
     * @param transactionId Unique identifier for the transfer
     */
    event VestingTransferred(
        address indexed grantor,
        address indexed beneficiary,
        uint256 amount,
        address stepVesting,
        string transactionId
    );

    /**
     * @notice Emitted when tokens are claimed from vesting
     * @param beneficiary Address claiming the tokens
     * @param stepVesting Address of the step vesting contract
     * @param amount Amount of tokens claimed
     */
    event VestingClaimed(address indexed beneficiary, address stepVesting, uint256 amount);

    /**
     * @notice Address of the vesting manager contract
     */
    address public manager;

    /**
     * @notice Mapping of addresses to their owned tokens
     * @dev Maps token owner address to token address
     */
    mapping(address => address) public _tokenOwner;

    /**
     * @notice Address of the admin
     */
    address public s2Admin;

    /**
     * @notice Initializes the vesting deployer contract
     * @dev Implementation of initializer for upgradeable pattern
     * @param _s2Admin Address of the admin
     * @param _manager Address of the manager contract
     */
    function initialize(address _s2Admin, address _manager) public initializer { 
        s2Admin = _s2Admin;
        manager = _manager;
    }

    /**
     * @notice Restricts function access to admin only
     * @custom:throws SS_VestingDeployer: Unauthorized user
     */
    modifier onlyAdmin() { 
        require(msg.sender == s2Admin, "SS_VestingDeployer: Unauthorized user");
        _;
    }

    /**
     * @notice Deploys a new vesting contract
     * @dev Creates a new StepVesting contract instance and makes it sellable
     * @param tokenAddress Address of the token to be vested
     * @param startTime Start time of the vesting schedule
     * @param endTime End time of the vesting schedule
     * @param steps Number of vesting steps
     * @param vestingId Unique identifier for the vesting contract
     * @custom:throws SS_VestingDeployer: caller is not the token owner
     * @custom:throws SS_VestingDeployer: start time must be before end time
     * @custom:throws SS_VestingDeployer: steps must be greater than 0
     * @custom:throws SS_VestingDeployer: manager not set
     */
    function deployVesting(
        address tokenAddress,
        uint256 startTime,
        uint256 endTime,
        uint256 steps,
        string memory vestingId
    ) external returns(address newVesting) {
        require(_tokenOwner[msg.sender] == tokenAddress, "SS_VestingDeployer: caller is not the token owner");
        //require(_tokenOwner[msg.sender] == address(SecondSwap_StepVesting(_stepVesting).token()), "SS_VestingDeployer: caller is not the token owner"); Can't implement this as the stepVesting Contract is not deployed
        require(tokenAddress != address(0), "SS_VestingDeployer: token address is zero"); // 3.2. Arbitrary transfer of vesting

        require(startTime < endTime, "SS_VestingDeployer: start time must be before end time");
        require(steps > 0, "SS_VestingDeployer: steps must be greater than 0");
        require(manager != address(0), "SS_VestingDeployer: manager not set");

        newVesting = address(
            new SecondSwap_StepVesting(
                msg.sender,
                manager,
                IERC20(tokenAddress),
                startTime,
                endTime,
                steps,
                address(this)
            )
        );
        IVestingManager(manager).setSellable(newVesting, true);
        emit VestingDeployed(tokenAddress, newVesting, vestingId);
    }

    /**
     * @notice Sets the owner for a token
     * @dev Maps token address to owner address
     * @param token Address of the token
     * @param _owner Address to be set as owner
     * @custom:throws Existing token have owner
     */
    function setTokenOwner(address token, address _owner) external onlyAdmin { 
        require(_tokenOwner[_owner] == address(0), "SS_VestingDeployer: Existing token have owner");
        _tokenOwner[_owner] = token;
    }

    /**
     * @notice Updates the manager address
     * @dev Sets new manager address for vesting management
     * @param _manager New manager address
     * @custom:throws Cannot assign the same address
     */
    function setManager(address _manager) external onlyAdmin { 
        require(manager != _manager, "SS_VestingDeployer: Cannot assign the same address");
        manager = _manager;
    }

    /**
     * @notice Updates the admin address
     * @dev Sets new admin address for vesting management
     * @param _admin New admin address
     * @custom:throws Cannot assign the same address
     */
    function setAdmin(address _admin) external onlyAdmin { 
        require(s2Admin != _admin, "SS_VestingDeployer: Cannot assign the same address");
        s2Admin = _admin;
    }

    /**
     * @notice Creates a new vesting schedule
     * @dev Creates vesting for a single beneficiary
     * @param _beneficiary Address receiving the vesting
     * @param _totalAmount Amount of tokens to vest
     * @param _stepVesting Address of the step vesting contract
     * @custom:throws SS_VestingDeployer: caller is not the token owner
     */
    function createVesting(address _beneficiary, uint256 _totalAmount, address _stepVesting) external { 
        require(
            _tokenOwner[msg.sender] == address(SecondSwap_StepVesting(_stepVesting).token()),
            "SS_VestingDeployer: caller is not the token owner"
        ); // 3.2. Arbitrary transfer of vesting
        SecondSwap_StepVesting(_stepVesting).createVesting(_beneficiary, _totalAmount);
        emit VestingCreated(_beneficiary, _totalAmount, _stepVesting);
    }

    /**
     * @notice Creates multiple vesting schedules in batch
     * @dev Creates vestings for multiple beneficiaries
     * @param _beneficiaries Array of beneficiary addresses
     * @param _totalAmounts Array of vesting amounts
     * @param _stepVesting Address of the step vesting contract
     * @custom:throws SS_VestingDeployer: caller is not the token owner
     */
    function createVestings(
        address[] memory _beneficiaries,
        uint256[] memory _totalAmounts,
        address _stepVesting
    ) external { 
        require(
            _tokenOwner[msg.sender] == address(SecondSwap_StepVesting(_stepVesting).token()),
            "SS_VestingDeployer: caller is not the token owner"
        ); // 3.2. Arbitrary transfer of vesting
        SecondSwap_StepVesting(_stepVesting).createVestings(_beneficiaries, _totalAmounts);
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            emit VestingCreated(_beneficiaries[i], _totalAmounts[i], _stepVesting);
        }
    }

    /**
     * @notice Transfers vesting between addresses
     * @dev Transfers vesting tokens from grantor to beneficiary
     * @param _grantor Address transferring the vesting
     * @param _beneficiary Address receiving the vesting
     * @param _amount Amount of tokens to transfer
     * @param _stepVesting Address of the step vesting contract
     * @param _transactionId Unique identifier for the transfer
     * @custom:throws SS_VestingDeployer: caller is not the token owner
     */
    function transferVesting(
        address _grantor,
        address _beneficiary,
        uint256 _amount,
        address _stepVesting,
        string memory _transactionId
    ) external { 
        require(
            _tokenOwner[msg.sender] == address(SecondSwap_StepVesting(_stepVesting).token()),
            "SS_VestingDeployer: caller is not the token owner"
        ); // 3.2. Arbitrary transfer of vesting
        SecondSwap_StepVesting(_stepVesting).transferVesting(_grantor, _beneficiary, _amount);
        emit VestingTransferred(_grantor, _beneficiary, _amount, _stepVesting, _transactionId);
    }

    /**
     * @notice Returns the current version of the contract
     * @return String representing the contract version
     */
    function version() public pure returns (string memory) { 
        return "1.0.0";
    }
}
```

- Create a `BaseTest.t.sol` where all the contracts are deployed.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "openzeppelin-foundry-upgrades/Upgrades.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SecondSwap_WhitelistDeployer} from "../contracts/SecondSwap_WhitelistDeployer.sol";
import {SecondSwap_VestingManager} from "../contracts/SecondSwap_VestingManager.sol";
import {SecondSwap_Marketplace} from "../contracts/SecondSwap_Marketplace.sol";
import {SecondSwap_StepVesting} from "../contracts/SecondSwap_StepVesting.sol";
import {SecondSwap_MarketplaceSetting} from "../contracts/SecondSwap_MarketplaceSetting.sol";
import {VestingDeployerMock} from "./VestingDeployerMock.sol";
import {TestToken} from "../contracts/TestToken.sol";
import {TestToken1} from "../contracts/USDT.sol";
import {IVestingManager} from "../contracts/interface/SecondSwap_IVestingManager.sol";

contract BaseTest is Test {
    TestToken public token;
    TestToken1 public usdt;
    address public tokenOwner;
    address public s2Admin;
    address public seller1;
    address public buyer1;
    SecondSwap_WhitelistDeployer public whitelistDeployer;
    address public proxyVestingManager;
    SecondSwap_MarketplaceSetting public marketplaceSetting;
    SecondSwap_Marketplace public marketplace;
    address public vesting;
    VestingDeployerMock public vestingDeployer;
    SecondSwap_VestingManager public manager;
    uint256 constant intialSupply = 1_000_000 ether;
    uint256 constant initialAmount = 1_000 ether;

    function setUp() public {
        tokenOwner = vm.addr(1);
        s2Admin = vm.addr(2);
        seller1 = vm.addr(3);
        buyer1 = vm.addr(4);
        address feeCollector = vm.addr(5);
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (60 * 60 * 24);
        uint256 steps = 200;

        /// Deploy TestToken contract
        token = new TestToken("TestToken", "TT", intialSupply);
        assertTrue(address(token) != address(0));

        /// Deploy USDT
        usdt = new TestToken1();
        assertTrue(address(token) != address(0));

        /// Deploy WhitelistDeployer
        whitelistDeployer = new SecondSwap_WhitelistDeployer();

        /// Deploy VestingManager
        address proxyManager = Upgrades.deployTransparentProxy(
            "SecondSwap_VestingManager.sol",
            msg.sender,
            abi.encodeCall(SecondSwap_VestingManager.initialize, (s2Admin))
        );
        manager = SecondSwap_VestingManager(proxyManager);
        assertEq(manager.s2Admin(), s2Admin);

        /// Deploy vestingDeployer
        address proxyVestingDeployer = Upgrades.deployTransparentProxy(
            "VestingDeployerMock.sol",
            msg.sender,
            abi.encodeCall(
                VestingDeployerMock.initialize,
                (s2Admin, address(manager))
            )
        );
        vestingDeployer = VestingDeployerMock(proxyVestingDeployer);

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

        /// Deploy MarkeplaceSetting
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
        address proxyMarketplace = Upgrades.deployTransparentProxy(
            "SecondSwap_Marketplace.sol",
            msg.sender,
            abi.encodeCall(
                SecondSwap_Marketplace.initialize,
                (address(token), address(marketplaceSetting))
            )
        );
        marketplace = SecondSwap_Marketplace(proxyMarketplace);
        assertEq(marketplace.version(), "1.0.0");

        token.transfer(tokenOwner, intialSupply);
        vm.startPrank(s2Admin);
        manager.setMarketplace(address(marketplace));
        vm.stopPrank();

        /// Create vesting for seller to be able to list tokens in the marketplace
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

- Then you can create a test contract for any group tests and make it inherits `BaseTest`.
- Now you can enjoy the setting and do your magic :)


