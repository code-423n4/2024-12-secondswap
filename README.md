# SecondSwap audit details
- Total Prize Pool: $35,000 in USDC
  - HM awards: $27,900 in USDC
  - QA awards: $1,200 in USDC
  - Judge awards: $3,200 in USDC
  - Validator awards: $2,200 in USDC
  - Scout awards: $500 in USDC
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts December 9, 2024 20:00 UTC
- Ends December 19, 2024 20:00 UTC

**Note re: risk level upgrades/downgrades**

Two important notes about judging phase risk adjustments: 
- High- or Medium-risk submissions downgraded to Low-risk (QA)) will be ineligible for awards.
- Upgrading a Low-risk finding from a QA report to a Medium- or High-risk finding is not supported.

As such, wardens are encouraged to select the appropriate risk level carefully during the submission phase.


## Automated Findings / Publicly Known Issues

The 4naly3er report can be found [here](https://github.com/code-423n4/2024-12-secondswap/blob/main/4naly3er-report.md).

_Note for C4 wardens: Anything included in this `Automated Findings / Publicly Known Issues` section is considered a publicly known issue and is ineligible for awards._

- Token issuers are given full control over their vesting contracts, this includes the ability to reallocate locked tokens from users that have bought their allocations from the marketplace.
- Whitelisting for private lots are done by the users themselves and this can lead to users not being able to purchase the lots because of an attacker whitelisting multiple addresses. 

# Overview

SecondSwap addresses the need for a secondary market where locked tokens can be traded offering Sellers an opportunity to get liquidity, at a discount or premium, while allowing opportunistic or higher conviction Buyers to capitalize on future upside.  In addition, Token Issuers have more control and are incentivised to facilitate transactions because they benefit by earning fees for every successful transaction.

Importantly, this secondary trading does not impact the current market prices of the token, nor does it change the vesting plan, due to the fact that the token or its derivative is not the subject of the current transactions. Rather, the platform facilitates the change in the original whitelisted wallet address (Seller) to a new whitelisted wallet address (Buyer) where the unlocked tokens will be transferred by the project in the future. This process is executed without interfering with the existing liquidity pools where the tokens are actively traded. At present this need is addressed primarily through opaque and inefficient Over-the-Counter (OTC) transactions with varying degrees of counterparty risks.

## Links

- **Previous audits:**  
- **Website:** https://secondswap.io/
- **X/Twitter:** https://x.com/secondswap_io

---

# Scope

### Files in scope


| File   | Logic Contracts | Interfaces | nSLOC | Purpose | Libraries used |
| ------ | --------------- | ---------- | ----- | -----   | ------------ |
| /contracts/SecondSwap_Marketplace.sol | 1| **** | 283 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol<br>hardhat/console.sol|
| /contracts/SecondSwap_MarketplaceSetting.sol | 1| **** | 115 | |@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/SecondSwap_StepVesting.sol | 1| **** | 139 | |@openzeppelin/contracts/utils/math/Math.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol<br>@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol|
| /contracts/SecondSwap_VestingDeployer.sol | 1| **** | 89 | |@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/SecondSwap_VestingManager.sol | 1| **** | 100 | |@openzeppelin/contracts/access/Ownable.sol<br>@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol<br>hardhat/console.sol|
| /contracts/SecondSwap_Whitelist.sol | 1| **** | 33 | |@openzeppelin/contracts/access/Ownable.sol<br>@openzeppelin/contracts/token/ERC20/IERC20.sol|
| /contracts/SecondSwap_WhitelistDeployer.sol | 1| **** | 10 | ||
| **Totals** | **7** | **** | **769** | | |

### Files out of scope

*See [out_of_scope.txt](https://github.com/code-423n4/2024-12-secondswap/blob/main/out_of_scope.txt)*

| File         |
| ------------ |
| ./contracts/TestToken.sol |
| ./contracts/USDT.sol |
| ./contracts/interface/* |
| Totals: 7 |

## Scoping Q &amp; A

### General questions

| Question                                | Answer                       |
| --------------------------------------- | ---------------------------- |
| ERC20 used by the protocol              |       Any (all possible ERC20s)             |
| Test coverage                           | ✅ SCOUTS: Please populate this after running the test coverage command                          |
| ERC721 used  by the protocol            |            None              |
| ERC777 used by the protocol             |           None                |
| ERC1155 used by the protocol            |              None            |
| Chains the protocol will be deployed on | Ethereum,Base,zkSync,Arbitrum |

### ERC20 token behaviors in scope

| Question                                                                                                                                                   | Answer |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| [Missing return values](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#missing-return-values)                                                      |   Out of scope  |
| [Fee on transfer](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#fee-on-transfer)                                                                  |  Out of scope  |
| [Balance changes outside of transfers](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#balance-modifications-outside-of-transfers-rebasingairdrops) | Out of scope    |
| [Upgradeability](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#upgradable-tokens)                                                                 |   Out of scope  |
| [Flash minting](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#flash-mintable-tokens)                                                              | Out of scope    |
| [Pausability](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#pausable-tokens)                                                                      | Out of scope    |
| [Approval race protections](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#approval-race-protections)                                              | Out of scope    |
| [Revert on approval to zero address](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-approval-to-zero-address)                            | Out of scope    |
| [Revert on zero value approvals](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-zero-value-approvals)                                    | Out of scope    |
| [Revert on zero value transfers](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-zero-value-transfers)                                    | Out of scope    |
| [Revert on transfer to the zero address](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-transfer-to-the-zero-address)                    | Out of scope    |
| [Revert on large approvals and/or transfers](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-large-approvals--transfers)                  | Out of scope    |
| [Doesn't revert on failure](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#no-revert-on-failure)                                                   |  Out of scope   |
| [Multiple token addresses](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#revert-on-zero-value-transfers)                                          | Out of scope    |
| [Low decimals ( < 6)](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#low-decimals)                                                                 |   In scope  |
| [High decimals ( > 18)](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#high-decimals)                                                              | In scope    |
| [Blocklists](https://github.com/d-xo/weird-erc20?tab=readme-ov-file#tokens-with-blocklists)                                                                | Out of scope    |

### External integrations (e.g., Uniswap) behavior in scope:

| Question                                                  | Answer |
| --------------------------------------------------------- | ------ |
| Enabling/disabling fees (e.g. Blur disables/enables fees) |   No   |
| Pausability (e.g. Uniswap pool gets paused)               |   No   |
| Upgradeability (e.g. Uniswap gets upgraded)               |   No   |

### EIP compliance checklist
N/A

# Additional context

## Main invariants

- All tokens locked in a vesting plan must be allocated and claimable (with the exception for tokens being transferred in directly).
- The token issuers must always be able to reallocate vestings.
- Token issuers are assigned by the SecondSwap admin.

## Attack ideas (where to focus for bugs)
Our primary areas of concerns are around:

Vesting
- Token locking mechanism
- Is the claimable amount correct at all times?
- Will the claimable amount still be correct if the token allocation amount for a user is increased or decreased?
- What would happen if the amount of locked tokens, duration or number of cycles are on the reaches extremes?
- Contract upgradability patterns

Marketplace
- Listing, Buying and Discount mechanisms
- Whitelist mechanism
- Are the allocations for buyer and seller still correct after making a trade?
- Are fees being distributed to the platform correctly?
- Would the transaction be reverted if there are any conflicting parameters for discounts? 
- Is the maximum sellable allocation enforced correctly?
- Can the marketplace manager be pause the marketplace in case of emergencies?
- Can vesting plans be delisted from the marketplace?
- Would users be able to claim back their vesting allocations if the vesting plan is delisted?
- Could all variables be set with values that will not cause any DoS or loss of funds?
- Contract upgradability patterns

## All trusted roles in the protocol

| Role                                | Description                       |
| --------------------------------------- | ---------------------------- |
| 2S Admin                          | Can:<br>- Assign token issuers to tokens<br>- Configure marketplace settings<br>- Enable and disable marketplace listing for vesting plans<br>- Pause and unpause the marketplace |
| Token issuer                             | Can deploy vesting plans and reallocate vesting allocations |

## Describe any novel or unique curve logic or mathematical models implemented in the contracts:

N/A

## Running tests

Steps are included in the git repository

✅ SCOUTS: Please format the response above 👆 using the template below👇

```bash
git clone https://github.com/code-423n4/2023-08-arbitrum
git submodule update --init --recursive
cd governance
foundryup
make install
make build
make sc-election-test
```
To run code coverage
```bash
make coverage
```
To run gas benchmarks
```bash
make gas
```

✅ SCOUTS: Add a screenshot of your terminal showing the gas report
✅ SCOUTS: Add a screenshot of your terminal showing the test coverage

## Miscellaneous
Employees of SecondSwap and employees' family members are ineligible to participate in this audit.

Code4rena's rules cannot be overridden by the contents of this README. In case of doubt, please check with C4 staff.
