# Report


## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings) | 6 |
| [GAS-2](#GAS-2) | Comparing to a Boolean constant | 1 |
| [GAS-3](#GAS-3) | Using bools for storage incurs overhead | 3 |
| [GAS-4](#GAS-4) | Cache array length outside of loop | 2 |
| [GAS-5](#GAS-5) | For Operations that will not overflow, you could use unchecked | 104 |
| [GAS-6](#GAS-6) | Use Custom Errors instead of Revert Strings to save Gas | 60 |
| [GAS-7](#GAS-7) | Avoid contract existence checks by using low level calls | 1 |
| [GAS-8](#GAS-8) | Functions guaranteed to revert when called by normal users can be marked `payable` | 21 |
| [GAS-9](#GAS-9) | `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`) | 3 |
| [GAS-10](#GAS-10) | Using `private` rather than `public` for constants, saves gas | 1 |
| [GAS-11](#GAS-11) | Splitting require() statements that use && saves gas | 2 |
| [GAS-12](#GAS-12) | Increments/decrements can be unchecked in for-loops | 2 |
| [GAS-13](#GAS-13) | Use != 0 instead of > 0 for unsigned integer comparison | 14 |
### <a name="GAS-1"></a>[GAS-1] `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings)
This saves **16 gas per instance.**

*Instances (6)*:
```solidity
File: SecondSwap_StepVesting.sol

198:         vesting.stepsClaimed += claimableSteps;

199:         vesting.amountClaimed += claimableAmount;

296:             _vestings[_beneficiary].totalAmount += _totalAmount;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingManager.sol

131:             sellLimit +=

136:         userAllocation.sold += amount;

162:         allocations[buyer][vesting].bought += amount;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="GAS-2"></a>[GAS-2] Comparing to a Boolean constant
Comparing to a constant (`true` or `false`) is a bit more expensive than directly checking the returned boolean value.

Consider using `if(directValue)` instead of `if(directValue == true)` and `if(!directValue)` instead of `if(directValue == false)`

*Instances (1)*:
```solidity
File: SecondSwap_Whitelist.sol

59:         require(userSettings[msg.sender] == false, "SS_Whitelist: User is whitelisted"); //3.9. Improper comparison in whitelistAddress function

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="GAS-3"></a>[GAS-3] Using bools for storage incurs overhead
Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

*Instances (3)*:
```solidity
File: SecondSwap_Marketplace.sol

106:     mapping(address => bool) public isTokenSupport;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

44:     bool public isMarketplaceFreeze;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_Whitelist.sol

25:     mapping(address => bool) public userSettings;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="GAS-4"></a>[GAS-4] Cache array length outside of loop
If not cached, the solidity compiler will always read the length of the array during each iteration. That is, if it is a storage array, this is an extra sload operation (100 additional extra gas for each iteration except for the first) and if it is a memory array, this is an extra mload operation (3 additional gas for each iteration except for the first).

*Instances (2)*:
```solidity
File: SecondSwap_StepVesting.sol

264:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

203:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

### <a name="GAS-5"></a>[GAS-5] For Operations that will not overflow, you could use unchecked

*Instances (104)*:
```solidity
File: SecondSwap_Marketplace.sol

3: import "./interface/IERC20.sol";

4: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

5: import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; //  3.6. DOS caused by the use of transfer and transferFrom functions

6: import "./interface/SecondSwap_IMarketplaceSetting.sol";

7: import "./interface/SecondSwap_IWhitelist.sol";

8: import "./interface/SecondSwap_IVestingManager.sol";

9: import "./SecondSwap_WhitelistDeployer.sol";

10: import "hardhat/console.sol";

17:     using SafeERC20 for IERC20; //  3.6. DOS caused by the use of transfer and transferFrom functions

261:         require(_amount > 0, "SS_Marketplace: Invalid listing amount"); // 3.10. Inefficient _listingType check

274:         ); // 3.1. Rounding issue leads to total drain of vesting entries

276:         uint256 baseAmount = (_amount * _price) /

278:                 10 **

287:             ); // 3.1. Rounding issue leads to total drain of vesting entries

288:         require(baseAmount > 0, "SS_Marketplace: Cannot list amount it is too little"); // 3.1. Rounding issue leads to total drain of vesting entries

296:         uint256 listingId = nextListingId[_vestingPlan]++;

349:             if ((listing.listTime + IMarketplaceSetting(marketplaceSetting).minListingDuration()) > block.timestamp) {

354:                 ); // 3.7. Value difference caused by the same penalty fee

357:                     IMarketplaceSetting(marketplaceSetting).feeCollector(), // 3.7. Value difference caused by the same penalty fee

359:                 ); //  3.6. DOS caused by the use of transfer and transferFrom functions

367:         ); //  3.4. The s2Admin is unable to unlist vesting

369:         listing.status = Status.DELIST; // 3.3. Buyer can choose listing price

370:         listing.balance = 0; // 3.3. Buyer can choose listing price

388:         require(listing.status == Status.LIST, "SS_Marketplace: Listing not active"); // 3.3. Buyer can choose listing price

417:             discountedPrice = (discountedPrice * (BASE - ((_amount * listing.discountPct) / listing.total))) / BASE;

419:             discountedPrice = (discountedPrice * (BASE - listing.discountPct)) / BASE;

434:         bfee = vpbf > -1 ? uint256(vpbf) : IMarketplaceSetting(marketplaceSetting).buyerFee();

435:         sfee = vpsf > -1 ? uint256(vpsf) : IMarketplaceSetting(marketplaceSetting).sellerFee();

459:         uint256 baseAmount = (_amount * discountedPrice) /

461:                 10 **

470:             ); // 3.1. Rounding issue leads to total drain of vesting entries

471:         require(baseAmount > 0, "SS_Marketplace: Amount too little"); // 3.1. Rounding issue leads to total drain of vesting entries

473:         buyerFeeTotal = (baseAmount * bfee) / BASE;

474:         sellerFeeTotal = (baseAmount * sfee) / BASE;

476:         IERC20(listing.currency).safeTransferFrom(msg.sender, address(this), (baseAmount + buyerFeeTotal)); //  3.6. DOS caused by the use of transfer and transferFrom functions

481:                 buyerFeeTotal -

482:                 (baseAmount * bfee * IMarketplaceSetting(marketplaceSetting).referralFee()) /

483:                 (BASE * BASE);

486:         IERC20(listing.currency).safeTransfer(listing.seller, (baseAmount - sellerFeeTotal)); //  3.6. DOS caused by the use of transfer and transferFrom functions

488:         uint256 feeCollectorTotal = (buyerFeeTotal + sellerFeeTotal);

492:         ); //  3.6. DOS caused by the use of transfer and transferFrom functions

530:         listing.balance -= _amount;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

4: import "./interface/SecondSwap_IMarketplaceSetting.sol";

5: import "./interface/SecondSwap_IVestingManager.sol";

6: import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

142:         buyerFee = 250; // 2.5% fee

143:         sellerFee = 250; // 2.5% fee

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_StepVesting.sol

4: import "./interface/SecondSwap_Vesting.sol";

5: import "@openzeppelin/contracts/utils/math/Math.sol";

6: import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

7: import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; //  3.6. DOS caused by the use of transfer and transferFrom functions

133:         stepDuration = (_endTime - _startTime) / _numOfSteps;

142:         return _vestings[_beneficiary].totalAmount - _vestings[_beneficiary].amountClaimed;

172:         uint256 elapsedTime = currentTime - startTime;

173:         uint256 currentStep = elapsedTime / stepDuration;

174:         uint256 claimableSteps = currentStep - vesting.stepsClaimed;

178:         if (vesting.stepsClaimed + claimableSteps >= numOfSteps) {

180:             claimableAmount = vesting.totalAmount - vesting.amountClaimed;

184:         claimableAmount = vesting.releaseRate * claimableSteps;

198:         vesting.stepsClaimed += claimableSteps;

199:         vesting.amountClaimed += claimableAmount;

201:         token.safeTransfer(msg.sender, claimableAmount); //  3.6. DOS caused by the use of transfer and transferFrom functions

225:             grantorVesting.totalAmount - grantorVesting.amountClaimed >= _amount,

227:         ); // 3.8. Claimed amount not checked in transferVesting function

229:         grantorVesting.totalAmount -= _amount;

230:         grantorVesting.releaseRate = grantorVesting.totalAmount / numOfSteps;

264:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

292:                 releaseRate: _totalAmount / (numOfSteps - _stepsClaimed),

296:             _vestings[_beneficiary].totalAmount += _totalAmount;

297:             if (numOfSteps - _vestings[_beneficiary].stepsClaimed != 0) {

299:                     (_vestings[_beneficiary].totalAmount - _vestings[_beneficiary].amountClaimed) /

300:                     (numOfSteps - _vestings[_beneficiary].stepsClaimed);

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

4: import "./SecondSwap_StepVesting.sol";

5: import "./interface/SecondSwap_IVestingManager.sol";

6: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

7: import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

113:         require(tokenAddress != address(0), "SS_VestingDeployer: token address is zero"); // 3.2. Arbitrary transfer of vesting

180:         ); // 3.2. Arbitrary transfer of vesting

201:         ); // 3.2. Arbitrary transfer of vesting

203:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

228:         ); // 3.2. Arbitrary transfer of vesting

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

4: import "./interface/SecondSwap_Vesting.sol";

5: import "./SecondSwap_StepVesting.sol";

6: import "./interface/SecondSwap_IVestingManager.sol";

7: import "@openzeppelin/contracts/access/Ownable.sol";

8: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

9: import "hardhat/console.sol";

130:         if (currentAlloc + userAllocation.sold > userAllocation.bought) {

131:             sellLimit +=

132:                 ((currentAlloc + userAllocation.sold - userAllocation.bought) * vestingSettings[plan].maxSellPercent) /

136:         userAllocation.sold += amount;

150:         allocations[seller][plan].sold -= amount;

162:         allocations[buyer][vesting].bought += amount;

181:             vestingSetting.buyerFee = -1;

182:             vestingSetting.sellerFee = -1;

224:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Buyer Fee cannot be less than 0");

237:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Seller fee cannot be less than 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

4: import "./interface/SecondSwap_IWhitelist.sol";

5: import "@openzeppelin/contracts/access/Ownable.sol";

6: import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

58:         require(totalWhitelist < maxWhitelist, "SS_Whitelist: Reached whitelist limit"); //3.9. Improper comparison in whitelistAddress function

59:         require(userSettings[msg.sender] == false, "SS_Whitelist: User is whitelisted"); //3.9. Improper comparison in whitelistAddress function

62:         totalWhitelist++;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

```solidity
File: SecondSwap_WhitelistDeployer.sol

4: import "./SecondSwap_Whitelist.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_WhitelistDeployer.sol)

### <a name="GAS-6"></a>[GAS-6] Use Custom Errors instead of Revert Strings to save Gas
Custom errors are available from solidity version 0.8.4. Custom errors save [**~50 gas**](https://gist.github.com/IllIllI000/ad1bd0d29a0101b25e57c293b4b0c746) each time they're hit by [avoiding having to allocate and store the revert string](https://blog.soliditylang.org/2021/04/21/custom-errors/#errors-in-depth). Not defining the strings also save deployment gas

Additionally, custom errors can be used inside and outside of contracts (including interfaces and libraries).

Source: <https://blog.soliditylang.org/2021/04/21/custom-errors/>:

> Starting from [Solidity v0.8.4](https://github.com/ethereum/solidity/releases/tag/v0.8.4), there is a convenient and gas-efficient way to explain to users why an operation failed through the use of custom errors. Until now, you could already use strings to give more information about failures (e.g., `revert("Insufficient funds.");`), but they are rather expensive, especially when it comes to deploy cost, and it is difficult to use dynamic information in them.

Consider replacing **all revert strings** with custom errors in the solution, and particularly those that have multiple occurrences:

*Instances (60)*:
```solidity
File: SecondSwap_Marketplace.sol

206:         require(msg.sender == IMarketplaceSetting(marketplaceSetting).s2Admin(), "SS_Marketplace: Unauthorized user");

207:         require(!isTokenSupport[_token], "SS_Marketplace: Token is currently supported");

256:         require(_price > 0, "SS_Marketplace: Price must be greater than 0");

261:         require(_amount > 0, "SS_Marketplace: Invalid listing amount"); // 3.10. Inefficient _listingType check

262:         require(isTokenSupport[_currency], "SS_Marketplace: Payment token is not supported");

288:         require(baseAmount > 0, "SS_Marketplace: Cannot list amount it is too little"); // 3.1. Rounding issue leads to total drain of vesting entries

300:             require(_maxWhitelist > 0, "SS_Marketplace: Minimum whitelist user cannot be 0");

341:         require(listing.status == Status.LIST, "SS_Marketplace: Listing not active");

388:         require(listing.status == Status.LIST, "SS_Marketplace: Listing not active"); // 3.3. Buyer can choose listing price

389:         require(msg.sender != _referral, "SS_Marketplace: Invalid referral");

403:         require(_amount <= listing.balance, "SS_Marketplace: Insufficient");

471:         require(baseAmount > 0, "SS_Marketplace: Amount too little"); // 3.1. Rounding issue leads to total drain of vesting entries

561:         require(msg.sender == IMarketplaceSetting(marketplaceSetting).s2Admin(), "SS_Marketplace: Unauthorized user");

562:         require(_marketplaceSetting != address(0), "SS_Marketplace: Address cannot be null");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

138:         require(_feeCollector != address(0), "SS_Marketplace_Settings: Invalid fee collector address");

139:         require(_s2Admin != address(0), "SS_Marketplace_Settings: Invalid admin address");

158:         require(msg.sender == s2Admin, "SS_Marketplace_Settings: Unauthorized user");

169:         require(_amount <= 5000, "SS_Marketplace_Settings: Buyer fee cannot be more than 50%");

181:         require(_amount <= 5000, "SS_Marketplace_Settings: Seller fee cannot be more than 50%");

194:         require(_address != address(0), "SS_Marketplace_Settings: Cannot be zero address");

195:         require(_address != feeCollector, "SS_Marketplace_Settings: Cannot be the same address");

207:         require(_amount > 0, "SS_Marketplace_Settings: Penalty fee cannot be less than 0");

218:         require(_seconds > 0, "SS_Marketplace_Settings: Duration must be greater than 0");

232:         require(msg.sender == s2Admin, "SS_Marketplace_Settings: Unauthorized Access");

233:         require(_user != address(0), "SS_Marketplace_Settings: Cannot be zero address");

234:         require(_user != s2Admin, "SS_Marketplace_Settings: Cannot be the same address");

257:         require(_percentage > 0, "SS_Marketplace_Settings: Percentage value cannot be 0");

258:         require(_percentage <= 10000, "SS_Marketplace_Settings: Percentage cannot be more than 100%");

270:         require(_whitelistDeployer != address(0), "SS_Marketplace_Settings: Cannot be zero address");

286:         require(_vestingManager != address(0), "SS_Marketplace_Settings: Cannot be zero address");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_StepVesting.sol

103:         require(msg.sender == manager, "SS_StepVesting: caller is not the manager");

195:         require(claimableAmount > 0, "SS_StepVesting: nothing to claim");

221:         require(_beneficiary != address(0), "SS_StepVesting: beneficiary is zero");

222:         require(_amount > 0, "SS_StepVesting: amount is zero");

261:         require(msg.sender == tokenIssuer || msg.sender == manager || msg.sender == vestingDeployer, "unauthorized");

262:         require(_beneficiaries.length == _totalAmounts.length, "SS_StepVesting: array length mismatch");

285:         require(_beneficiary != address(0), "SS_StepVesting: beneficiary is zero");

286:         require(_totalAmount > 0, "SS_StepVesting: total amount is zero");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

87:         require(msg.sender == s2Admin, "SS_VestingDeployer: Unauthorized user");

111:         require(_tokenOwner[msg.sender] == tokenAddress, "SS_VestingDeployer: caller is not the token owner");

113:         require(tokenAddress != address(0), "SS_VestingDeployer: token address is zero"); // 3.2. Arbitrary transfer of vesting

115:         require(startTime < endTime, "SS_VestingDeployer: start time must be before end time");

116:         require(steps > 0, "SS_VestingDeployer: steps must be greater than 0");

117:         require(manager != address(0), "SS_VestingDeployer: manager not set");

142:         require(_tokenOwner[_owner] == address(0), "SS_VestingDeployer: Existing token have owner");

153:         require(manager != _manager, "SS_VestingDeployer: Cannot assign the same address");

164:         require(s2Admin != _admin, "SS_VestingDeployer: Cannot assign the same address");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

90:         require(msg.sender == marketplace, "SS_VestingManager: caller is not marketplace");

98:         require(msg.sender == s2Admin, "SS_VestingManager: Unauthorized user");

122:         require(vestingSettings[plan].sellable, "vesting not sellable");

123:         require(SecondSwap_Vesting(plan).available(seller) >= amount, "SS_VestingManager: insufficient availablility");

138:         require(userAllocation.sold <= sellLimit, "SS_VestingManager: cannot list more than max sell percent");

174:         require(s2Admin == msg.sender || vestingDeployer == msg.sender, "SS_VestingManager: Unauthorised user");

195:         require(SecondSwap_StepVesting(vesting).tokenIssuer() == msg.sender, "SS_VestingManager: Invalid Token Issuer");

224:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Buyer Fee cannot be less than 0");

237:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Seller fee cannot be less than 0");

248:         require(_vestingDeployer != vestingDeployer, "SS_VestingManager: VestingDeployer cannot be the same");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

58:         require(totalWhitelist < maxWhitelist, "SS_Whitelist: Reached whitelist limit"); //3.9. Improper comparison in whitelistAddress function

59:         require(userSettings[msg.sender] == false, "SS_Whitelist: User is whitelisted"); //3.9. Improper comparison in whitelistAddress function

84:         require(msg.sender == lotOwner, "SS_Whitelist: not lot owner");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="GAS-7"></a>[GAS-7] Avoid contract existence checks by using low level calls
Prior to 0.8.10 the compiler inserted extra code, including `EXTCODESIZE` (**100 gas**), to check for contract existence for external function calls. In more recent solidity versions, the compiler will not insert these checks if the external call has a return value. Similar behavior can be achieved in earlier versions by using low-level calls, since low level calls never check for contract existence

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

351:                     (IMarketplaceSetting(marketplaceSetting).usdt()).balanceOf(msg.sender) >=

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="GAS-8"></a>[GAS-8] Functions guaranteed to revert when called by normal users can be marked `payable`
If a function modifier such as `onlyOwner` is used, the function will revert if a normal user tries to pay the function. Marking the function as `payable` will lower the gas cost for legitimate callers because the compiler will not include checks for whether a payment was provided.

*Instances (21)*:
```solidity
File: SecondSwap_MarketplaceSetting.sol

168:     function setBuyerFee(uint256 _amount) external onlyAdmin {

180:     function setSellerFee(uint256 _amount) external onlyAdmin {

193:     function setFeeAccount(address _address) external onlyAdmin {

206:     function setPenaltyFee(uint256 _amount) external onlyAdmin {

217:     function setMinListingDuration(uint256 _seconds) external onlyAdmin {

244:     function setMarketplaceStatus(bool _status) external onlyAdmin {

256:     function setReferral(uint256 _percentage) external onlyAdmin {

269:     function setWhitelistDeployer(address _whitelistDeployer) external onlyAdmin {

285:     function setManager(address _vestingManager) external onlyAdmin {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

141:     function setTokenOwner(address token, address _owner) external onlyAdmin {

152:     function setManager(address _manager) external onlyAdmin {

163:     function setAdmin(address _admin) external onlyAdmin {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

121:     function listVesting(address seller, address plan, uint256 amount) external onlyMarketplace {

149:     function unlistVesting(address seller, address plan, uint256 amount) external onlyMarketplace {

161:     function completePurchase(address buyer, address vesting, uint256 amount) external onlyMarketplace {

204:     function setMarketplace(address _marketplace) external onlyAdmin {

212:     function setAdmin(address _admin) external onlyAdmin {

223:     function setBuyerFee(address _vesting, int256 _fee) external onlyAdmin {

236:     function setSellerFee(address _vesting, int256 _fee) external onlyAdmin {

247:     function setVestingDeployer(address _vestingDeployer) external onlyAdmin {

262:     function getVestingTokenAddress(address _vestingPlan) external view onlyMarketplace returns (address _token) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="GAS-9"></a>[GAS-9] `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`)
Pre-increments and pre-decrements are cheaper.

For a `uint256 i` variable, the following is true with the Optimizer enabled at 10k:

**Increment:**

- `i += 1` is the most expensive form
- `i++` costs 6 gas less than `i += 1`
- `++i` costs 5 gas less than `i++` (11 gas less than `i += 1`)

**Decrement:**

- `i -= 1` is the most expensive form
- `i--` costs 11 gas less than `i -= 1`
- `--i` costs 5 gas less than `i--` (16 gas less than `i -= 1`)

Note that post-increments (or post-decrements) return the old value before incrementing or decrementing, hence the name *post-increment*:

```solidity
uint i = 1;  
uint j = 2;
require(j == i++, "This will be false as i is incremented after the comparison");
```
  
However, pre-increments (or pre-decrements) return the new value:
  
```solidity
uint i = 1;  
uint j = 2;
require(j == ++i, "This will be true as i is incremented before the comparison");
```

In the pre-increment case, the compiler has to create a temporary variable (when used) for returning `1` instead of `2`.

Consider using pre-increments and pre-decrements where they are relevant (meaning: not where post-increments/decrements logic are relevant).

*Saves 5 gas per instance*

*Instances (3)*:
```solidity
File: SecondSwap_StepVesting.sol

264:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

203:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_Whitelist.sol

62:         totalWhitelist++;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="GAS-10"></a>[GAS-10] Using `private` rather than `public` for constants, saves gas
If needed, the values can be read from the verified contract source code, or if there are multiple values there can be a single getter function that [returns a tuple](https://github.com/code-423n4/2022-08-frax/blob/90f55a9ce4e25bceed3a74290b854341d8de6afa/src/contracts/FraxlendPair.sol#L156-L178) of the values of all currently-public constants. Saves **3406-3606 gas** in deployment gas due to the compiler not having to create non-payable getter functions for deployment calldata, not having to store the bytes of the value outside of where it's used, and not adding another entry to the method ID table

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

112:     uint256 public constant BASE = 10000;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="GAS-11"></a>[GAS-11] Splitting require() statements that use && saves gas

*Instances (2)*:
```solidity
File: SecondSwap_VestingManager.sol

224:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Buyer Fee cannot be less than 0");

237:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Seller fee cannot be less than 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="GAS-12"></a>[GAS-12] Increments/decrements can be unchecked in for-loops
In Solidity 0.8+, there's a default overflow check on unsigned integers. It's possible to uncheck this in for-loops and save some gas at each iteration, but at the cost of some code readability, as this uncheck cannot be made inline.

[ethereum/solidity#10695](https://github.com/ethereum/solidity/issues/10695)

The change would be:

```diff
- for (uint256 i; i < numIterations; i++) {
+ for (uint256 i; i < numIterations;) {
 // ...  
+   unchecked { ++i; }
}  
```

These save around **25 gas saved** per instance.

The same can be applied with decrements (which should use `break` when `i == 0`).

The risk of overflow is non-existent for `uint256`.

*Instances (2)*:
```solidity
File: SecondSwap_StepVesting.sol

264:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

203:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

### <a name="GAS-13"></a>[GAS-13] Use != 0 instead of > 0 for unsigned integer comparison

*Instances (14)*:
```solidity
File: SecondSwap_Marketplace.sol

253:             _listingType != ListingType.SINGLE || (_minPurchaseAmt > 0 && _minPurchaseAmt <= _amount),

256:         require(_price > 0, "SS_Marketplace: Price must be greater than 0");

258:             (_discountType != DiscountType.NO && _discountPct > 0) || (_discountType == DiscountType.NO),

261:         require(_amount > 0, "SS_Marketplace: Invalid listing amount"); // 3.10. Inefficient _listingType check

288:         require(baseAmount > 0, "SS_Marketplace: Cannot list amount it is too little"); // 3.1. Rounding issue leads to total drain of vesting entries

300:             require(_maxWhitelist > 0, "SS_Marketplace: Minimum whitelist user cannot be 0");

471:         require(baseAmount > 0, "SS_Marketplace: Amount too little"); // 3.1. Rounding issue leads to total drain of vesting entries

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

207:         require(_amount > 0, "SS_Marketplace_Settings: Penalty fee cannot be less than 0");

218:         require(_seconds > 0, "SS_Marketplace_Settings: Duration must be greater than 0");

257:         require(_percentage > 0, "SS_Marketplace_Settings: Percentage value cannot be 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_StepVesting.sol

195:         require(claimableAmount > 0, "SS_StepVesting: nothing to claim");

222:         require(_amount > 0, "SS_StepVesting: amount is zero");

286:         require(_totalAmount > 0, "SS_StepVesting: total amount is zero");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

116:         require(steps > 0, "SS_VestingDeployer: steps must be greater than 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)


## Non Critical Issues


| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | Replace `abi.encodeWithSignature` and `abi.encodeWithSelector` with `abi.encodeCall` which keeps the code typo/type safe | 1 |
| [NC-2](#NC-2) | `constant`s should be defined rather than using magic numbers | 14 |
| [NC-3](#NC-3) | Control structures do not follow the Solidity Style Guide | 2 |
| [NC-4](#NC-4) | Critical Changes Should Use Two-step Procedure | 3 |
| [NC-5](#NC-5) | Default Visibility for constants | 1 |
| [NC-6](#NC-6) | Delete rogue `console.log` imports | 2 |
| [NC-7](#NC-7) | Functions should not be longer than 50 lines | 46 |
| [NC-8](#NC-8) | Lines are too long | 1 |
| [NC-9](#NC-9) | Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor | 16 |
| [NC-10](#NC-10) | Consider using named mappings | 8 |
| [NC-11](#NC-11) | Avoid the use of sensitive terms | 52 |
| [NC-12](#NC-12) | Use Underscores for Number Literals (add an underscore every 3 digits) | 10 |
| [NC-13](#NC-13) | Variables need not be initialized to zero | 3 |
### <a name="NC-1"></a>[NC-1] Replace `abi.encodeWithSignature` and `abi.encodeWithSelector` with `abi.encodeCall` which keeps the code typo/type safe
When using `abi.encodeWithSignature`, it is possible to include a typo for the correct function signature.
When using `abi.encodeWithSignature` or `abi.encodeWithSelector`, it is also possible to provide parameters that are not of the correct type for the function.

To avoid these pitfalls, it would be best to use [`abi.encodeCall`](https://solidity-by-example.org/abi-encode/) instead.

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

326:         (bool success, ) = target.staticcall(abi.encodeWithSelector(selector));

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="NC-2"></a>[NC-2] `constant`s should be defined rather than using magic numbers
Even [assembly](https://github.com/code-423n4/2022-05-opensea-seaport/blob/9d7ce4d08bf3c3010304a0476a785c70c0e90ae7/contracts/lib/TokenTransferrer.sol#L35-L39) can benefit from using readable constants instead of hex/numeric literals

*Instances (14)*:
```solidity
File: SecondSwap_Marketplace.sol

278:                 10 **

461:                 10 **

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

142:         buyerFee = 250; // 2.5% fee

143:         sellerFee = 250; // 2.5% fee

144:         penaltyFee = 10 ether;

145:         minListingDuration = 120;

146:         referralFee = 1000;

169:         require(_amount <= 5000, "SS_Marketplace_Settings: Buyer fee cannot be more than 50%");

181:         require(_amount <= 5000, "SS_Marketplace_Settings: Seller fee cannot be more than 50%");

258:         require(_percentage <= 10000, "SS_Marketplace_Settings: Percentage cannot be more than 100%");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_VestingManager.sol

180:             vestingSetting.maxSellPercent = 2000;

183:             emit MaxSellPercentUpdated(vesting, 2000);

224:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Buyer Fee cannot be less than 0");

237:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Seller fee cannot be less than 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="NC-3"></a>[NC-3] Control structures do not follow the Solidity Style Guide
See the [control structures](https://docs.soliditylang.org/en/latest/style-guide.html#control-structures) section of the Solidity Style Guide

*Instances (2)*:
```solidity
File: SecondSwap_Marketplace.sol

354:                 ); // 3.7. Value difference caused by the same penalty fee

357:                     IMarketplaceSetting(marketplaceSetting).feeCollector(), // 3.7. Value difference caused by the same penalty fee

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="NC-4"></a>[NC-4] Critical Changes Should Use Two-step Procedure
The critical procedures should be two step process.

See similar findings in previous Code4rena contests for reference: <https://code4rena.com/reports/2022-06-illuminate/#2-critical-changes-should-use-two-step-procedure>

**Recommended Mitigation Steps**

Lack of two-step procedure for critical operations leaves them error-prone. Consider adding two step procedure on the critical functions.

*Instances (3)*:
```solidity
File: SecondSwap_VestingDeployer.sol

141:     function setTokenOwner(address token, address _owner) external onlyAdmin {

163:     function setAdmin(address _admin) external onlyAdmin {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

212:     function setAdmin(address _admin) external onlyAdmin {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="NC-5"></a>[NC-5] Default Visibility for constants
Some constants are using the default visibility. For readability, consider explicitly declaring them as `internal`.

*Instances (1)*:
```solidity
File: SecondSwap_VestingManager.sol

84:     uint256 constant BASE = 10000;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="NC-6"></a>[NC-6] Delete rogue `console.log` imports
These shouldn't be deployed in production

*Instances (2)*:
```solidity
File: SecondSwap_Marketplace.sol

10: import "hardhat/console.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_VestingManager.sol

9: import "hardhat/console.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="NC-7"></a>[NC-7] Functions should not be longer than 50 lines
Overly complex code can make understanding functionality more difficult, try to further modularize your code to ensure readability 

*Instances (46)*:
```solidity
File: SecondSwap_Marketplace.sol

180:     function initialize(address _token, address _marketplaceSetting) public initializer {

324:     function doesFunctionExist(address target, string memory functionSignature) public view returns (bool) {

339:     function unlistVesting(address _vestingPlan, uint256 _listingId) external isFreeze {

387:     function _validatePurchase(Listing storage listing, uint256 _amount, address _referral) private view {

413:     function _getDiscountedPrice(Listing storage listing, uint256 _amount) private view returns (uint256) {

432:     function _getFees(address _vestingPlan) private view returns (uint256 bfee, uint256 sfee) {

560:     function setMarketplaceSettingAddress(address _marketplaceSetting) external {

571:     function version() public pure returns (string memory) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

168:     function setBuyerFee(uint256 _amount) external onlyAdmin {

180:     function setSellerFee(uint256 _amount) external onlyAdmin {

193:     function setFeeAccount(address _address) external onlyAdmin {

206:     function setPenaltyFee(uint256 _amount) external onlyAdmin {

217:     function setMinListingDuration(uint256 _seconds) external onlyAdmin {

244:     function setMarketplaceStatus(bool _status) external onlyAdmin {

256:     function setReferral(uint256 _percentage) external onlyAdmin {

269:     function setWhitelistDeployer(address _whitelistDeployer) external onlyAdmin {

285:     function setManager(address _vestingManager) external onlyAdmin {

301:     function getVestingFees(address _vesting) public view returns (int256 VPbuyerFee, int256 VPsellerFee) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_StepVesting.sol

141:     function available(address _beneficiary) external view returns (uint256) {

150:     function total(address _beneficiary) external view returns (uint256) {

161:     function claimable(address _beneficiary) public view returns (uint256, uint256) {

216:     function transferVesting(address _grantor, address _beneficiary, uint256 _amount) external {

244:     function createVesting(address _beneficiary, uint256 _totalAmount) external {

260:     function createVestings(address[] memory _beneficiaries, uint256[] memory _totalAmounts) external {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

77:     function initialize(address _s2Admin, address _manager) public initializer {

141:     function setTokenOwner(address token, address _owner) external onlyAdmin {

152:     function setManager(address _manager) external onlyAdmin {

163:     function setAdmin(address _admin) external onlyAdmin {

176:     function createVesting(address _beneficiary, uint256 _totalAmount, address _stepVesting) external {

237:     function version() public pure returns (string memory) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

107:     function initialize(address _s2admin) public initializer {

121:     function listVesting(address seller, address plan, uint256 amount) external onlyMarketplace {

149:     function unlistVesting(address seller, address plan, uint256 amount) external onlyMarketplace {

161:     function completePurchase(address buyer, address vesting, uint256 amount) external onlyMarketplace {

173:     function setSellable(address vesting, bool sellable) external {

194:     function setMaxSellPercent(address vesting, uint256 maxSellPercent) external {

204:     function setMarketplace(address _marketplace) external onlyAdmin {

212:     function setAdmin(address _admin) external onlyAdmin {

223:     function setBuyerFee(address _vesting, int256 _fee) external onlyAdmin {

236:     function setSellerFee(address _vesting, int256 _fee) external onlyAdmin {

247:     function setVestingDeployer(address _vestingDeployer) external onlyAdmin {

258:     function getVestingFees(address _vestingPlan) external view returns (int256 buyerFee, int256 sellerFee) {

262:     function getVestingTokenAddress(address _vestingPlan) external view onlyMarketplace returns (address _token) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

72:     function validateAddress(address _userAddress) external view returns (bool) {

83:     function setMaxWhitelist(uint256 _maxWhitelist) external {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

```solidity
File: SecondSwap_WhitelistDeployer.sol

26:     function deployWhitelist(uint256 _maxWhitelist, address _lotOwner) external returns (address) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_WhitelistDeployer.sol)

### <a name="NC-8"></a>[NC-8] Lines are too long
Usually lines in source code are limited to [80](https://softwareengineering.stackexchange.com/questions/148677/why-is-80-characters-the-standard-limit-for-code-width) characters. Today's screens are much larger so it's reasonable to stretch this in some cases. Since the files will most likely reside in GitHub, and GitHub starts using a scroll bar in all cases when the length is over [164](https://github.com/aizatto/character-length) characters, the lines below should be split when they reach that length

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

476:         IERC20(listing.currency).safeTransferFrom(msg.sender, address(this), (baseAmount + buyerFeeTotal)); //  3.6. DOS caused by the use of transfer and transferFrom functions

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="NC-9"></a>[NC-9] Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor
If a function is supposed to be access-controlled, a `modifier` should be used instead of a `require/if` statement for more readability.

*Instances (16)*:
```solidity
File: SecondSwap_Marketplace.sol

206:         require(msg.sender == IMarketplaceSetting(marketplaceSetting).s2Admin(), "SS_Marketplace: Unauthorized user");

347:         if (msg.sender != IMarketplaceSetting(marketplaceSetting).s2Admin()) {

389:         require(msg.sender != _referral, "SS_Marketplace: Invalid referral");

561:         require(msg.sender == IMarketplaceSetting(marketplaceSetting).s2Admin(), "SS_Marketplace: Unauthorized user");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

158:         require(msg.sender == s2Admin, "SS_Marketplace_Settings: Unauthorized user");

232:         require(msg.sender == s2Admin, "SS_Marketplace_Settings: Unauthorized Access");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_StepVesting.sol

103:         require(msg.sender == manager, "SS_StepVesting: caller is not the manager");

261:         require(msg.sender == tokenIssuer || msg.sender == manager || msg.sender == vestingDeployer, "unauthorized");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

87:         require(msg.sender == s2Admin, "SS_VestingDeployer: Unauthorized user");

111:         require(_tokenOwner[msg.sender] == tokenAddress, "SS_VestingDeployer: caller is not the token owner");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

90:         require(msg.sender == marketplace, "SS_VestingManager: caller is not marketplace");

98:         require(msg.sender == s2Admin, "SS_VestingManager: Unauthorized user");

174:         require(s2Admin == msg.sender || vestingDeployer == msg.sender, "SS_VestingManager: Unauthorised user");

195:         require(SecondSwap_StepVesting(vesting).tokenIssuer() == msg.sender, "SS_VestingManager: Invalid Token Issuer");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

59:         require(userSettings[msg.sender] == false, "SS_Whitelist: User is whitelisted"); //3.9. Improper comparison in whitelistAddress function

84:         require(msg.sender == lotOwner, "SS_Whitelist: not lot owner");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="NC-10"></a>[NC-10] Consider using named mappings
Consider moving to solidity version 0.8.18 or later, and using [named mappings](https://ethereum.stackexchange.com/questions/51629/how-to-name-the-arguments-in-mapping/145555#145555) to make it easier to understand the purpose of each mapping

*Instances (8)*:
```solidity
File: SecondSwap_Marketplace.sol

94:     mapping(address => mapping(uint256 => Listing)) public listings;

100:     mapping(address => uint256) public nextListingId;

106:     mapping(address => bool) public isTokenSupport;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_StepVesting.sol

81:     mapping(address => Vesting) public _vestings;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

64:     mapping(address => address) public _tokenOwner;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

58:     mapping(address => VestingSettings) public vestingSettings;

64:     mapping(address => mapping(address => Allocation)) public allocations;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

25:     mapping(address => bool) public userSettings;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="NC-11"></a>[NC-11] Avoid the use of sensitive terms
Use [alternative variants](https://www.zdnet.com/article/mysql-drops-master-slave-and-blacklist-whitelist-terminology/), e.g. allowlist/denylist instead of whitelist/blacklist

*Instances (52)*:
```solidity
File: SecondSwap_Marketplace.sol

7: import "./interface/SecondSwap_IWhitelist.sol";

9: import "./SecondSwap_WhitelistDeployer.sol";

78:         address whitelist;

160:     event WhitelistCreated(

163:         address whitelistAddress,

165:         uint256 maxWhitelist

247:         uint256 _maxWhitelist,

297:         address whitelistAddress;

300:             require(_maxWhitelist > 0, "SS_Marketplace: Minimum whitelist user cannot be 0");

301:             whitelistAddress = SecondSwap_WhitelistDeployer(IMarketplaceSetting(marketplaceSetting).whitelistDeployer())

302:                 .deployWhitelist(_maxWhitelist, msg.sender);

303:             emit WhitelistCreated(_vestingPlan, listingId, whitelistAddress, msg.sender, _maxWhitelist);

315:             whitelist: whitelistAddress,

391:             listing.whitelist == address(0) || IWhitelist(listing.whitelist).validateAddress(msg.sender),

392:             "SS_Marketplace: Not whitelisted"

479:         if (_referral != address(0) && listing.whitelist == address(0)) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

59:     address public whitelistDeployer;

134:         address _whitelistDeployer,

148:         whitelistDeployer = _whitelistDeployer;

269:     function setWhitelistDeployer(address _whitelistDeployer) external onlyAdmin {

270:         require(_whitelistDeployer != address(0), "SS_Marketplace_Settings: Cannot be zero address");

272:             _whitelistDeployer != address(whitelistDeployer),

273:             "SS_Marketplace_Settings: Cannot be the same whitelist address"

275:         whitelistDeployer = _whitelistDeployer;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_Whitelist.sol

4: import "./interface/SecondSwap_IWhitelist.sol";

12: contract SecondSwap_Whitelist is IWhitelist {

14:     uint256 public maxWhitelist;

17:     uint256 public totalWhitelist;

32:     event WhitelistedAddress(uint256 _balanceWhitelist, address userAddress);

39:     event ChangeMaxWhitelist(uint256 balanceWhitelist, uint256 maxWhitelist);

47:     constructor(uint256 _maxWhitelist, address _lotOwner) {

48:         maxWhitelist = _maxWhitelist;

57:     function whitelistAddress() external {

58:         require(totalWhitelist < maxWhitelist, "SS_Whitelist: Reached whitelist limit"); //3.9. Improper comparison in whitelistAddress function

59:         require(userSettings[msg.sender] == false, "SS_Whitelist: User is whitelisted"); //3.9. Improper comparison in whitelistAddress function

62:         totalWhitelist++;

63:         emit WhitelistedAddress(totalWhitelist, msg.sender);

83:     function setMaxWhitelist(uint256 _maxWhitelist) external {

84:         require(msg.sender == lotOwner, "SS_Whitelist: not lot owner");

86:             _maxWhitelist > maxWhitelist,

87:             "SS_Whitelist: amount cannot be lesser that the current whitelist amount"

90:             _maxWhitelist > totalWhitelist,

91:             "SS_Whitelist: amount cannot be lesser that the current whitelist amount"

94:         maxWhitelist = _maxWhitelist;

95:         emit ChangeMaxWhitelist(totalWhitelist, maxWhitelist);

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

```solidity
File: SecondSwap_WhitelistDeployer.sol

4: import "./SecondSwap_Whitelist.sol";

11: contract SecondSwap_WhitelistDeployer {

17:     event WhitelistCreated(address indexed whitelistContract, address _lotOwner);

26:     function deployWhitelist(uint256 _maxWhitelist, address _lotOwner) external returns (address) {

27:         address newWhitelist = address(new SecondSwap_Whitelist(_maxWhitelist, _lotOwner));

28:         emit WhitelistCreated(newWhitelist, _lotOwner);

29:         return newWhitelist;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_WhitelistDeployer.sol)

### <a name="NC-12"></a>[NC-12] Use Underscores for Number Literals (add an underscore every 3 digits)

*Instances (10)*:
```solidity
File: SecondSwap_Marketplace.sol

112:     uint256 public constant BASE = 10000;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_MarketplaceSetting.sol

146:         referralFee = 1000;

169:         require(_amount <= 5000, "SS_Marketplace_Settings: Buyer fee cannot be more than 50%");

181:         require(_amount <= 5000, "SS_Marketplace_Settings: Seller fee cannot be more than 50%");

258:         require(_percentage <= 10000, "SS_Marketplace_Settings: Percentage cannot be more than 100%");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_MarketplaceSetting.sol)

```solidity
File: SecondSwap_VestingManager.sol

84:     uint256 constant BASE = 10000;

180:             vestingSetting.maxSellPercent = 2000;

183:             emit MaxSellPercentUpdated(vesting, 2000);

224:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Buyer Fee cannot be less than 0");

237:         require(_fee >= -1 && _fee <= 5000, "SS_VestingManager: Seller fee cannot be less than 0");

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="NC-13"></a>[NC-13] Variables need not be initialized to zero
The default value for variables is zero, so initializing them to zero is superfluous.

*Instances (3)*:
```solidity
File: SecondSwap_Marketplace.sol

346:         uint256 _penaltyFee = 0;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_StepVesting.sol

264:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

203:         for (uint256 i = 0; i < _beneficiaries.length; i++) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | `decimals()` is not a part of the ERC-20 standard | 2 |
| [L-2](#L-2) | Division by zero not prevented | 5 |
| [L-3](#L-3) | Initializers could be front-run | 3 |
| [L-4](#L-4) | Signature use at deadlines should be allowed | 1 |
| [L-5](#L-5) | Possible rounding issue | 1 |
| [L-6](#L-6) | Loss of precision | 4 |
| [L-7](#L-7) | Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership` | 2 |
| [L-8](#L-8) | Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions | 3 |
| [L-9](#L-9) | Upgradeable contract not initialized | 6 |
### <a name="L-1"></a>[L-1] `decimals()` is not a part of the ERC-20 standard
The `decimals()` function is not a part of the [ERC-20 standard](https://eips.ethereum.org/EIPS/eip-20), and was added later as an [optional extension](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol). As such, some valid ERC20 tokens do not support this interface, so it is unsafe to blindly cast all tokens to this interface, and then call this function.

*Instances (2)*:
```solidity
File: SecondSwap_Marketplace.sol

285:                         ).decimals()

468:                         ).decimals()

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="L-2"></a>[L-2] Division by zero not prevented
The divisions below take an input parameter which does not have any zero-value checks, which may lead to the functions reverting when zero is passed.

*Instances (5)*:
```solidity
File: SecondSwap_Marketplace.sol

417:             discountedPrice = (discountedPrice * (BASE - ((_amount * listing.discountPct) / listing.total))) / BASE;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_StepVesting.sol

133:         stepDuration = (_endTime - _startTime) / _numOfSteps;

173:         uint256 currentStep = elapsedTime / stepDuration;

230:         grantorVesting.releaseRate = grantorVesting.totalAmount / numOfSteps;

292:                 releaseRate: _totalAmount / (numOfSteps - _stepsClaimed),

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_StepVesting.sol)

### <a name="L-3"></a>[L-3] Initializers could be front-run
Initializers could be front-run, allowing an attacker to either set their own values, take ownership of the contract, and in the best case forcing a re-deployment

*Instances (3)*:
```solidity
File: SecondSwap_Marketplace.sol

180:     function initialize(address _token, address _marketplaceSetting) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

77:     function initialize(address _s2Admin, address _manager) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

107:     function initialize(address _s2admin) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="L-4"></a>[L-4] Signature use at deadlines should be allowed
According to [EIP-2612](https://github.com/ethereum/EIPs/blob/71dc97318013bf2ac572ab63fab530ac9ef419ca/EIPS/eip-2612.md?plain=1#L58), signatures used on exactly the deadline timestamp are supposed to be allowed. While the signature may or may not be used for the exact EIP-2612 use case (transfer approvals), for consistency's sake, all deadlines should follow this semantic. If the timestamp is an expiration rather than a deadline, consider whether it makes more sense to include the expiration timestamp as a valid timestamp, as is done for deadlines.

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

349:             if ((listing.listTime + IMarketplaceSetting(marketplaceSetting).minListingDuration()) > block.timestamp) {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="L-5"></a>[L-5] Possible rounding issue
Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator. Also, there is indication of multiplication and division without the use of parenthesis which could result in issues.

*Instances (1)*:
```solidity
File: SecondSwap_Marketplace.sol

417:             discountedPrice = (discountedPrice * (BASE - ((_amount * listing.discountPct) / listing.total))) / BASE;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="L-6"></a>[L-6] Loss of precision
Division by large numbers may result in the result being zero, due to solidity not supporting fractions. Consider requiring a minimum amount for the numerator to ensure that it is always larger than the denominator

*Instances (4)*:
```solidity
File: SecondSwap_Marketplace.sol

417:             discountedPrice = (discountedPrice * (BASE - ((_amount * listing.discountPct) / listing.total))) / BASE;

419:             discountedPrice = (discountedPrice * (BASE - listing.discountPct)) / BASE;

473:         buyerFeeTotal = (baseAmount * bfee) / BASE;

474:         sellerFeeTotal = (baseAmount * sfee) / BASE;

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

### <a name="L-7"></a>[L-7] Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership`
Use [Ownable2Step.transferOwnership](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol) which is safer. Use it as it is more secure due to 2-stage ownership transfer.

**Recommended Mitigation Steps**

Use <a href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable2Step.sol">Ownable2Step.sol</a>
  
  ```solidity
      function acceptOwnership() external {
          address sender = _msgSender();
          require(pendingOwner() == sender, "Ownable2Step: caller is not the new owner");
          _transferOwnership(sender);
      }
```

*Instances (2)*:
```solidity
File: SecondSwap_VestingManager.sol

7: import "@openzeppelin/contracts/access/Ownable.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

```solidity
File: SecondSwap_Whitelist.sol

5: import "@openzeppelin/contracts/access/Ownable.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Whitelist.sol)

### <a name="L-8"></a>[L-8] Upgradeable contract is missing a `__gap[50]` storage variable to allow for new storage variables in later versions
See [this](https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps) link for a description of this storage variable. While some contracts may not currently be sub-classed, adding the variable now protects against forgetting to add it in the future.

*Instances (3)*:
```solidity
File: SecondSwap_Marketplace.sol

4: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

6: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

8: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

### <a name="L-9"></a>[L-9] Upgradeable contract not initialized
Upgradeable contracts are initialized via an initializer function rather than by a constructor. Leaving such a contract uninitialized may lead to it being taken over by a malicious user

*Instances (6)*:
```solidity
File: SecondSwap_Marketplace.sol

4: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

180:     function initialize(address _token, address _marketplaceSetting) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_Marketplace.sol)

```solidity
File: SecondSwap_VestingDeployer.sol

6: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

77:     function initialize(address _s2Admin, address _manager) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingDeployer.sol)

```solidity
File: SecondSwap_VestingManager.sol

8: import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

107:     function initialize(address _s2admin) public initializer {

```
[Link to code](https://github.com/code-423n4/2024-12-secondswapSecondSwap_VestingManager.sol)

