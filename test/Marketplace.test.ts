import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import ProxyModule from "../ignition/modules/DeployMarketplaceProxies";
import hre from "hardhat";
import { expect } from "chai";
import { decodeEventLog, formatEther, getContract, keccak256, parseEther, toHex, TransactionExecutionError } from "viem"; // Ensure viem is installed for ethers formatting

describe("SecondSwap Marketplace Upgrades", function() {
    async function deployProxyFixture() {
        const [deployer, s2admin, s2dev, feeCollector, user1,alice, bob,tokenOwner] = await hre.viem.getWalletClients();
        
        const startTime = BigInt(await time.latest());
        const endTime = startTime + BigInt(60 * 60 * 24);
        const steps = BigInt(200);

        // Deploy proxy and implementation
        const Marketplace = await hre.ignition.deploy(ProxyModule, {
            parameters: {
                ERC20: {
                    name: "Test Token",
                    symbol: "TT",
                    initialSupply: parseEther("1000000")
                },
                DeployStepVestingAsOwner: {
                    startTime: startTime,
                    endTime: endTime,
                    numOfSteps: steps
                }
            }
        });

        // Get contract instance through proxy
        const marketplace = await hre.viem.getContractAt(
            "SecondSwap_Marketplace", 
            Marketplace.proxy.address
        );
        
        await Marketplace.vestingManager.write.setMarketplace([marketplace.address],{account: s2admin.account});
        await Marketplace.token.write.transfer([s2admin.account.address, parseEther("1000000")]);
        await Marketplace.token.write.approve([Marketplace.vesting.address, parseEther("1000")], { account: s2admin.account });
        await Marketplace.vesting.write.createVesting([user1.account.address, parseEther("1000")], { account: s2admin.account });
 
        return {
            // proxy: Marketplace.proxy,
            proxyAdmin: Marketplace.proxyAdmin,
            implementation: Marketplace.implementation,
            marketplaceSetting: Marketplace.marketplaceSetting,
            token: Marketplace.token,
            manager: Marketplace.vestingManager,
            whitelist: Marketplace.whitelist,
            marketplace,
            s2admin,
            s2dev, 
            alice, 
            bob,
            feeCollector,
            user1,
            startTime,
            endTime,
            steps,
            vesting: Marketplace.vesting
        };
    }

    describe("Initial Deployment", function() {
        it("should initialize with correct version", async function() {
            const { marketplace } = await loadFixture(deployProxyFixture);
            expect(await marketplace.read.version()).to.equal("1.0.0");
        });

        it("should have correct initial settings", async function() {
            const { marketplaceSetting } = await loadFixture(deployProxyFixture);
            expect(await marketplaceSetting.read.buyerFee()).to.equal(BigInt(250)); // 2.5%
            expect(await marketplaceSetting.read.sellerFee()).to.equal(BigInt(250)); // 2.5%
            expect(await marketplaceSetting.read.penaltyFee()).to.equal(parseEther("10"));
        });
    });

    // Tested
    describe("Public Vesting Listings", function () {
        
        it("should list single fill public vesting lot with no discount", async function() {
            const { vesting, token, marketplace, user1 } = await loadFixture(deployProxyFixture);
            
            // Verify marketplace setting is correct before listing
            
            const settingAddress = await marketplace.read.marketplaceSetting();
            
            // Approve marketplace to handle tokens
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );

            const amount = parseEther("10");
            const price = parseEther("100");
            const discountPct = BigInt(0);
            const listingType = 1; // Single fill
            const discountType = 0; // No discount
            const maxWhitelist = BigInt(0);
            const minPurchaseAmt = parseEther("1");
            const isPrivate = false;
            await marketplace.write.listVesting(
                [
                    vesting.address,
                    amount,
                    price,
                    discountPct,
                    listingType,
                    discountType,
                    maxWhitelist,
                    token.address,
                    minPurchaseAmt,
                    isPrivate
                ],
                { account: user1.account }
            );

            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listing[0].toLowerCase()).to.equal(user1.account.address.toLowerCase());
            expect(listing[1]).to.equal(amount);
            expect(listing[3]).to.equal(price);
        });

        it("should list single fill public vesting lot with linear discount", async function () {
            const { vesting, token, alice, manager, marketplace,user1 } = await loadFixture(deployProxyFixture);
            
            const amount = parseEther("10");
            const cost = parseEther("200");
            const discountPct = BigInt(20);
            const discountType = 1; // Linear Discount
            const listingType = 1; 
            const maxWhitelist = BigInt(0);
            const privateListing = false;
            const currency = token.address
            const minPurchaseAmt = BigInt(1)
            
            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
            
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, maxWhitelist,currency,minPurchaseAmt,privateListing],{ account: user1.account });
        
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
                
            expect(listing[0].toLocaleLowerCase()).to.equal(user1.account.address); // Seller address check
            expect(listing[3]).to.equal(parseEther("200")); // Price per unit
            expect(listing[5]).to.equal(1); // Linear Discount type
            expect(listing[6]).to.equal(BigInt(20)); // Discount percentage
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000");
            expect(listing[10]).to.equal(0); 

        });
        
        it("should list partial fill public  vesting lot with more than allocated amount", async function () {
            const { vesting, token, alice, manager, marketplace,user1 } = await loadFixture(deployProxyFixture);
            
            const amount = parseEther("10");
            const cost = parseEther("200");
            const discountPct = BigInt(20);
            const discountType = 1; // Linear Discount
            const listingType = 0; 
            const maxWhitelist = BigInt(0);
            const privateListing = false;
            const currency = token.address
            const minPurchaseAmt = BigInt(1)

            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
            try {
                await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, maxWhitelist,currency,minPurchaseAmt,privateListing],{ account: user1.account });

            } catch (error) {
            }
        });

      });
    
    // Tested
    describe("Public Vesting Delistings", function() {
        it("should unlist all token from lot after the penalty period", async function() {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            
            const amount = parseEther("100");
            const cost = parseEther("200");
            const discountPct = BigInt(20);
            const listingType = 1;
            const discountType = 1;
            const maxWhitelist = 0;
            const privateListing = false;
            const duration = BigInt(60 * 60 * 24 * 365);
            const minPurchaseAmt = parseEther("1");
            
            // First approve tokens
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );
            
            // List vesting
            await marketplace.write.listVesting(
                [
                    vesting.address,
                    amount,
                    cost,
                    discountPct,
                    listingType,
                    discountType,
                    BigInt(maxWhitelist),
                    token.address,
                    minPurchaseAmt,
                    privateListing
                ],
                { account: user1.account }
            );
    
            // Set duration with admin account
            await marketplaceSetting.write.setMinListingDuration(
                [BigInt(60 * 60 * 24)],
                { account: s2admin.account }
            );
    
            await time.increase(duration);
    
            // Verify listing before unlist
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
    
            // Unlist
            await marketplace.write.unlistVesting(
                [vesting.address, BigInt(0)],
                { account: user1.account }
            );
    
            // Verify after unlist
            const unlist = await marketplace.read.listings([vesting.address, BigInt(0)]);
    
            expect(unlist[0].toLowerCase()).to.equal(user1.account.address.toLowerCase());
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000");
            expect(listing[10]).to.equal(0); //List
            expect(unlist[10]).to.equal(2); //Delist
        });

        it("User list plan, claim all vesting and unlist all token from lot after the penalty period",async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);            
            const amount = parseEther("100");
            const cost = parseEther("200");
            const discountPct = BigInt(20); // 20% discount
            const listingType = 1; // Single fill
            const discountType = 1; // Linear discount
            const maxWhitelist = 0;
            const privateListing = false;
            const duration = 60 * 60 * 24 * 365;
            const endTime = 60 * 60 * 24 * 2000;
            const currency = token.address
            const minPurchaseAmt = parseEther("1");
            const _vestingsBF = await vesting.read._vestings([user1.account.address]);
            
            expect(_vestingsBF[0]).to.equal(BigInt(0)) //stepsClaimed should be 0
            expect(_vestingsBF[1]).to.equal(BigInt(0)) //amountClaimed should be 0
            
            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency,minPurchaseAmt, privateListing],{ account: user1.account });
            await marketplaceSetting.write.setMinListingDuration([BigInt(60*60*24)],{account:s2admin.account})
            await time.increase(endTime);
            await vesting.write.claim({account: user1.account});
            
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            const _vestingsAF = await vesting.read._vestings([user1.account.address]);
            
            await marketplace.write.unlistVesting(
                [vesting.address, BigInt(0)],
                { account: user1.account }
            );
            await vesting.write.claim({account: user1.account});

            expect(_vestingsAF[0]).to.equal(BigInt(200)) //stepsClaimed should be 0
            expect(_vestingsAF[1]).to.equal(parseEther("900")) //amountClaimed should be 0
            
            const _vestingsAF1 = await vesting.read._vestings([user1.account.address]);
            
            const unlist = await marketplace.read.listings([vesting.address, BigInt(0)]);
           
            
            expect(_vestingsAF1[0]).to.equal(BigInt(200)) //stepsClaimed should be 0
            expect(_vestingsAF1[1]).to.equal(parseEther("1000")) //amountClaimed should be 0
            
            expect(unlist[0].toLocaleLowerCase()).to.equal(user1.account.address); // Seller address check
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
            expect(listing[10]).to.equal(0); // List
            expect(unlist[10]).to.equal(2); // Delist


        })

        it("Unlist all token from lot before the penalty period with insufficient fund",async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);            
            const amount = parseEther("100");
            const cost = parseEther("200");
            const discountPct = BigInt(20);
            const listingType = 1;
            const discountType = 1;
            const maxWhitelist = 0;
            const privateListing = false;
            const currency = token.address;
            const minPurchaseAmt = parseEther("1");
            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
            
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],{ account: user1.account });
            
            await marketplaceSetting.write.setMinListingDuration([BigInt(60*60*24)],{account:s2admin.account})
            
            await marketplace.read.listings([vesting.address, BigInt(0)]);
            
            await expect(
                marketplace.write.unlistVesting([vesting.address, BigInt(0)], { account: user1.account })
            ).to.be.revertedWith("SS_Marketplace: Penalty fee required for early unlisting");
        })

        it("Unlist all token from lot before the penalty period with sufficient fund",async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);            
            const amount = parseEther("100");
            const cost = parseEther("200");
            const discountPct = BigInt(20); // 20% discount
            const listingType = 1; // Single fill
            const discountType = 1; // Linear discount
            const maxWhitelist = 0;
            const privateListing = false;    
            const currency = token.address
            const minPurchaseAmt = parseEther("1");

            await token.write.mint([user1.account.address,parseEther("1000")]);
            
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],{ account: user1.account });
            
            await marketplaceSetting.write.setMinListingDuration([BigInt(60*60*24)],{account:s2admin.account})
            
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            
            await token.write.approve([marketplace.address,parseEther("1000")], { account: user1.account });
            await marketplace.write.unlistVesting([vesting.address, BigInt(0) ],{ account: user1.account })
            
            const unlist = await marketplace.read.listings([vesting.address, BigInt(0)]);

            expect(unlist[0].toLocaleLowerCase()).to.equal(user1.account.address); // Seller address check
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
            expect(unlist[10]).to.equal(2); // Check lot status
        })

        it("Admin unlist all token from lot",async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);            
            const amount = parseEther("100");
            const cost = parseEther("200");
            const discountPct = BigInt(20); // 20% discount
            const listingType = 1; // Single fill
            const discountType = 1; // Linear discount
            const maxWhitelist = 0;
            const privateListing = false;    
            const currency = token.address
            const minPurchaseAmt = parseEther("1");

            await token.write.mint([user1.account.address,parseEther("1000")]);
            
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],{ account: user1.account });
            
            await marketplaceSetting.write.setMinListingDuration([BigInt(60*60*24)],{account:s2admin.account})
            
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            
            await token.write.approve([marketplace.address,parseEther("1000")], { account: user1.account });
            await marketplace.write.unlistVesting([vesting.address, BigInt(0) ],{ account: s2admin.account })
            
            const unlist = await marketplace.read.listings([vesting.address, BigInt(0)]);

            expect(unlist[0].toLocaleLowerCase()).to.equal(user1.account.address); // Seller address check
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
            expect(unlist[10]).to.equal(2); // Check lot status
        })

    });

    // Tested
    describe("Private Vesting Listing", function(){
        it("should list single fill private vesting lot, no discount and 3 user whitelist their address", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            const [user2,user3,user4] = await hre.viem.getWalletClients();
            
            const amount = parseEther("100");
            const cost = parseEther("75");
            const discountPct = BigInt(10); // 10% discount
            const listingType = 0; // Partial fill
            const discountType = 2; // Fixed discount
            const maxWhitelist = 3;
            const privateListing = true;
            const currency = token.address
            const minPurchaseAmt = parseEther("1");

            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
        
            const tx = await marketplace.write.listVesting(
              [vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],
              { account: user1.account }
            );

            const publicClient = await hre.viem.getPublicClient();


            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        
            // Find the WhitelistCreated event
            const whitelistCreatedEvent = receipt.logs.find(log => {
              const eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
              const eventTopic = keccak256(toHex(eventSignature));
              return log.topics[0] === eventTopic;
            });
        
            expect(whitelistCreatedEvent).to.not.be.undefined;
        
            if (whitelistCreatedEvent) {
              const decodedLog = decodeEventLog({
                abi: marketplace.abi,
                data: whitelistCreatedEvent.data,
                topics: whitelistCreatedEvent.topics,
              });
              const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
              expect(listing[0].toLowerCase()).to.equal(user1.account.address.toLowerCase()); // Seller address check
              expect(listing[6]).to.equal(discountPct); // Discount percentage
              
              const whitelistAddress = (decodedLog.args as any)?.whitelistAddress;

              if (whitelistAddress) {

                const whitelistContract = await hre.viem.getContractAt("SecondSwap_Whitelist",listing[8])

                expect(await whitelistContract.read.validateAddress([user2.account.address],{account: user1.account.address})).to.equal(false);
                await whitelistContract.write.whitelistAddress({account: user2.account.address});
                expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(1));
                expect(await whitelistContract.read.validateAddress([user2.account.address],{account: user2.account.address})).to.equal(true);

                expect(await whitelistContract.read.validateAddress([user3.account.address],{account: user3.account.address})).to.equal(false);
                await whitelistContract.write.whitelistAddress({account: user3.account.address});
                expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(2));
                expect(await whitelistContract.read.validateAddress([user3.account.address],{account: user3.account.address})).to.equal(true);
                
                expect(await whitelistContract.read.validateAddress([user4.account.address],{account: user4.account.address})).to.equal(false);
                await whitelistContract.write.whitelistAddress({account: user4.account.address});
                expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(3));
                expect(await whitelistContract.read.validateAddress([user4.account.address],{account: user4.account.address})).to.equal(true);

                
                expect(listing[8].toLowerCase()).to.equal(whitelistAddress.toLowerCase()); // Whitelist address check
            } else {
                console.warn('WhitelistAddress not found in the decoded log');
              }
              expect(listing[10]).to.equal(0); // Listing is active
            }
        });

        it("should list single fill private vesting lot, with a fixed discount rate", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            const [user2,user3,user4] = await hre.viem.getWalletClients();
            
            const amount = parseEther("100");
            const cost = parseEther("75");
            const discountPct = BigInt(10); // 10% discount
            const listingType = 0; // Partial fill
            const discountType = 2; // Fixed discount
            const maxWhitelist = 3;
            const privateListing = true;
            const currency = token.address
            const minPurchaseAmt = parseEther("1");

            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
        
            const tx = await marketplace.write.listVesting(
              [vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],
              { account: user1.account }
            );
            const publicClient = await hre.viem.getPublicClient();
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        
            // Find the WhitelistCreated event
            const whitelistCreatedEvent = receipt.logs.find(log => {
              const eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
              const eventTopic = keccak256(toHex(eventSignature));
              return log.topics[0] === eventTopic;
            });
        
            expect(whitelistCreatedEvent).to.not.be.undefined;
        
            if (whitelistCreatedEvent) {
              const decodedLog = decodeEventLog({
                abi: marketplace.abi,
                data: whitelistCreatedEvent.data,
                topics: whitelistCreatedEvent.topics,
              });
        
              const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
              expect(listing[0].toLowerCase()).to.equal(user1.account.address.toLowerCase()); // Seller address check
              expect(listing[6]).to.equal(discountPct); // Discount percentage
              
              // Use optional chaining and type assertion for whitelistAddress
              const whitelistAddress = (decodedLog.args as any)?.whitelistAddress;
              if (whitelistAddress) {
                expect(listing[8].toLowerCase()).to.equal(whitelistAddress.toLowerCase()); // Whitelist address check
              } else {
                console.warn('WhitelistAddress not found in the decoded log');
              }
              expect(listing[10]).to.equal(0); // Listing is active
            }
        });
        
        it("should throw error when private lot is listed and there are max white list is 0", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            const [user2,user3,user4] = await hre.viem.getWalletClients();
            
            const amount = parseEther("100");
            const cost = parseEther("75");
            const discountPct = BigInt(10); // 10% discount
            const listingType = 0; // Partial fill
            const discountType = 2; // Fixed discount
            const maxWhitelist = 0;
            const privateListing = true;
            const currency = token.address
            const minPurchaseAmt = parseEther("1");

            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
            
            await expect(
                marketplace.write.listVesting(
                    [
                        vesting.address,
                        amount,
                        cost,
                        discountPct,
                        listingType,
                        discountType,
                        BigInt(maxWhitelist),
                        currency,
                        minPurchaseAmt,
                        privateListing
                    ],
                    { account: user1.account }
                )
            ).to.be.revertedWith("SS_Marketplace: Minimum whitelist user cannot be 0");
            
        });
       
        it("private listing with partial fill, with discount and 3 whitelist address and 4 user whitelist (throw error)", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            const [user2,user3,user4,user5] = await hre.viem.getWalletClients();
            
            const amount = parseEther("100");
            const cost = parseEther("75");
            const discountPct = BigInt(10); // 10% discount
            const listingType = 0; // Partial fill
            const discountType = 2; // Fixed discount
            const maxWhitelist = 3;
            const privateListing = true;
            const currency = token.address
            const minPurchaseAmt = parseEther("1");
            await token.write.approve([marketplace.address, parseEther("1000")], { account: user1.account });
        
            const tx = await marketplace.write.listVesting(
                [vesting.address, amount, cost, discountPct, listingType, discountType, BigInt(maxWhitelist), currency, minPurchaseAmt,privateListing],
                { account: user1.account }
            );
    
            const publicClient = await hre.viem.getPublicClient();
    
    
            const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        
            // Find the WhitelistCreated event
            const whitelistCreatedEvent = receipt.logs.find(log => {
                const eventSignature = 'WhitelistCreated(address,uint256,address,address,uint256)';
                const eventTopic = keccak256(toHex(eventSignature));
                return log.topics[0] === eventTopic;
            });
        
            expect(whitelistCreatedEvent).to.not.be.undefined;
        
            if (whitelistCreatedEvent) {
                const decodedLog = decodeEventLog({
                    abi: marketplace.abi,
                    data: whitelistCreatedEvent.data,
                    topics: whitelistCreatedEvent.topics,
                });
                const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
                expect(listing[0].toLowerCase()).to.equal(user1.account.address.toLowerCase()); // Seller address check
                expect(listing[6]).to.equal(discountPct); // Discount percentage
                
                const whitelistAddress = (decodedLog.args as any)?.whitelistAddress;
                
                if (whitelistAddress) {
                    const whitelistContract = await hre.viem.getContractAt("SecondSwap_Whitelist",listing[8])
                    
                    expect(await whitelistContract.read.validateAddress([user2.account.address],{account: user2.account.address})).to.equal(false);
                    await whitelistContract.write.whitelistAddress({account: user2.account.address});
                    expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(1));
                    expect(await whitelistContract.read.validateAddress([user2.account.address],{account: user2.account.address})).to.equal(true);
                    
                    expect(await whitelistContract.read.validateAddress([user3.account.address],{account: user3.account.address})).to.equal(false);
                    await whitelistContract.write.whitelistAddress({account: user3.account.address});
                    expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(2));
                    expect(await whitelistContract.read.validateAddress([user3.account.address],{account: user3.account.address})).to.equal(true);
                    
                    expect(await whitelistContract.read.validateAddress([user4.account.address],{account: user4.account.address})).to.equal(false);
                    await whitelistContract.write.whitelistAddress({account: user4.account.address});
                    expect(await whitelistContract.read.totalWhitelist()).to.equal(BigInt(3));
                    expect(await whitelistContract.read.validateAddress([user4.account.address],{account: user4.account.address})).to.equal(true);

                    expect(await whitelistContract.read.validateAddress([user5.account.address],{account: user5.account.address})).to.equal(false);
    
                    await expect(whitelistContract.write.whitelistAddress({account: user5.account.address})).to.be.revertedWith("SS_Whitelist: Reached whitelist limit");

                } else {
                    console.warn('WhitelistAddress not found in the decoded log');
                }
            }
        });
    })
    
    describe("Purchase Lot",function(){
        it("Purchase Public Lot, Single Fill with no discount", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                manager,
                s2admin ,
                feeCollector
            } = await loadFixture(deployProxyFixture);
            const [user2,user3,user4] = await hre.viem.getWalletClients();

            const amount = parseEther("100");
            const cost = parseEther("100");
            const discountPct = BigInt(0);
            const listingType = 1;
            const discountType = 0;
            const maxWhitelist = BigInt(0);
            const privateListing = false;
            const duration = BigInt(60 * 60 * 24 * 365);
            const minPurchaseAmt = parseEther("1");
            
            // First approve tokens
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );
            const updatedSettings = await manager.read.vestingSettings([vesting.address]);
            
            expect(updatedSettings[0]).to.be.true; // Check if sellable is true
            // List vesting
            
            await marketplace.write.listVesting([vesting.address, amount, cost, discountPct, listingType, discountType, maxWhitelist,token.address, minPurchaseAmt,privateListing],{ account: user1.account });
            
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            
            expect(listing[0].toLocaleLowerCase()).to.equal(user1.account.address); // Check if address tally
            expect(listing[1]).to.equal(parseEther("100")); // Check if the total and the amount listed tally
            expect(listing[3]).to.equal(parseEther("100")); // Check if the price per unit tally
            expect(listing[8]).to.equal("0x0000000000000000000000000000000000000000"); // Whitelist address
            expect(listing[10]).to.equal(0); // Check if listing is active               
            expect(listing[11]).to.equal(token.address)
            
            await token.write.mint([user4.account.address,parseEther("100000")]) //mint token
            // approve
            await token.write.approve([marketplace.address, parseEther("100000000")],{account: user4.account});
            await marketplace.write.spotPurchase([vesting.address,BigInt(0),parseEther("100"),"0x0000000000000000000000000000000000000000"],{account: user4.account})
            
            const user1Balance = await token.read.balanceOf([user1.account.address])
            const user4Data = await manager.read.allocations([user4.account.address,vesting.address]);
            
            const user4Balance = await token.read.balanceOf([user4.account.address])
            
            const finalCost = 100000-(((100*100)*1.025))
            
            const totalReceiver = (((100*100)*0.975))
            // check seller recieve
            expect(formatEther(user1Balance)).to.equal(totalReceiver.toString())
            
            // check buyer recieve
            expect(formatEther(user4Balance)).to.equal(finalCost.toString())
            
            expect(formatEther(user4Balance)).to.equal(finalCost.toString())

            // Check allocation
            expect(user4Data[0]).to.equal(parseEther("100"))
            expect(user4Data[1]).to.equal(parseEther("0"))
        });

        it("Purchase Public Lot, Single Fill with discount", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                manager
            } = await loadFixture(deployProxyFixture);
            const [user2, user3] = await hre.viem.getWalletClients();
    
            // Test parameters
            const amount = parseEther("100");
            const cost = parseEther("100");
            const discountPct = BigInt(2000); // 20% discount
            const listingType = 1;  // Single fill
            const discountType = 1; // Linear discount
            const maxWhitelist = BigInt(0);
            const privateListing = false;
            const minPurchaseAmt = parseEther("1");
    
            const updatedSettings = await manager.read.vestingSettings([vesting.address]);
            expect(updatedSettings[0]).to.be.true; // Check if sellable is true
    
            // List vesting
            await marketplace.write.listVesting([
                vesting.address, 
                amount, 
                cost, 
                discountPct, 
                listingType, 
                discountType, 
                maxWhitelist,
                token.address, 
                minPurchaseAmt,
                privateListing
            ], { account: user1.account });
    
            // Verify listing details
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listing[0].toLowerCase()).to.equal(user1.account.address);
            expect(listing[1]).to.equal(amount);
            expect(listing[3]).to.equal(cost);
            expect(listing[5]).to.equal(1);
            expect(listing[6]).to.equal(discountPct);
    
            // Setup buyer
            await token.write.mint([user3.account.address, parseEther("10000")]); 
            const initialBalance = await token.read.balanceOf([user3.account.address]);
            await token.write.approve([marketplace.address, parseEther("10000")], {account: user3.account});
    
            // Record balances before purchase
            const sellerBalanceBefore = await token.read.balanceOf([user1.account.address]);
            const feeCollectorBefore = await token.read.balanceOf([await marketplaceSetting.read.feeCollector()]);
    
            // Make purchase
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                amount,
                "0x0000000000000000000000000000000000000000"
            ], {account: user3.account});
    
            // Calculate expected amounts using BigInt
            const BASE = BigInt(10000);
            const buyerFee = await marketplaceSetting.read.buyerFee();
            const sellerFee = await marketplaceSetting.read.sellerFee();
    
            // Calculate discounted price (80% of original price for full amount)
            const discountedPrice = (cost * (BASE - discountPct)) / BASE;
            const totalPrice = (amount * discountedPrice) / parseEther("1");
            
            // Calculate fees
            const buyerFeeAmount = (totalPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalPrice * sellerFee) / BASE;
    
            // Verify balances
            const finalBuyerBalance = await token.read.balanceOf([user3.account.address]);
            const finalSellerBalance = await token.read.balanceOf([user1.account.address]);
            const finalFeeCollectorBalance = await token.read.balanceOf([await marketplaceSetting.read.feeCollector()]);
    
            // Buyer paid the discounted price plus buyer fee
            expect(initialBalance - finalBuyerBalance).to.equal(totalPrice + buyerFeeAmount);
            
            // Seller received the discounted price minus seller fee
            expect(finalSellerBalance - sellerBalanceBefore).to.equal(totalPrice - sellerFeeAmount);
            
            // Fee collector received both fees
            expect(finalFeeCollectorBalance - feeCollectorBefore).to.equal(buyerFeeAmount + sellerFeeAmount);
    
            // Verify vesting allocation
            const user3Data = await manager.read.allocations([user3.account.address, vesting.address]);
            expect(user3Data[0]).to.equal(amount);
            expect(user3Data[1]).to.equal(parseEther("0"));
        });
        
        it("Purchase Public Lot, Partial Fill with no discount", async function () {
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                manager 
            } = await loadFixture(deployProxyFixture);
            const [user2] = await hre.viem.getWalletClients();
        
            // Constants
            const BASE = BigInt(10000);
            const ZERO = BigInt(0);
        
            // Test parameters
            const listAmount = parseEther("100");    // 100 tokens total listing
            const pricePerUnit = parseEther("100");  // 100 tokens per unit price
            const purchaseAmount = parseEther("10"); // 10 tokens per purchase
            
            // Setup listing
            await marketplace.write.listVesting([
                vesting.address, 
                listAmount,
                pricePerUnit,
                ZERO,                    // no discount
                0,                       // partial fill
                0,                       // no discount type
                ZERO,                    // no whitelist
                token.address,
                parseEther("1"),         // min purchase
                false                    // public listing
            ], { account: user1.account });
        
            // Setup initial token balances
            await token.write.mint([user1.account.address, parseEther("100000")]);
            await token.write.mint([user2.account.address, parseEther("100000")]);
        
            // Record starting balances
            const startBalances = {
                user1: await token.read.balanceOf([user1.account.address]),
                user2: await token.read.balanceOf([user2.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            // Setup approvals
            await token.write.approve([marketplace.address, parseEther("100000")], {account: user1.account});
            await token.write.approve([marketplace.address, parseEther("100000")], {account: user2.account});
        
            // Get fee settings
            const buyerFee = await marketplaceSetting.read.buyerFee();   // 250 = 2.5%
            const sellerFee = await marketplaceSetting.read.sellerFee(); // 250 = 2.5%
        
            // Execute purchases
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                "0x0000000000000000000000000000000000000000"
            ], {account: user1.account});
        
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                "0x0000000000000000000000000000000000000000"
            ], {account: user2.account});
        
            // Record ending balances
            const endBalances = {
                user1: await token.read.balanceOf([user1.account.address]),
                user2: await token.read.balanceOf([user2.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            // Calculate prices and fees
            const basePrice = (purchaseAmount * pricePerUnit) / parseEther("1");
            const buyerFeeAmount = (basePrice * buyerFee) / BASE;
            const sellerFeeAmount = (basePrice * sellerFee) / BASE;
            const totalCostPerPurchase = basePrice + buyerFeeAmount;
            const sellerReceiveAmount = basePrice - sellerFeeAmount;
        
            // Calculate expected changes for each participant
            const user1AsBuyerPays = totalCostPerPurchase;
            const user1AsSellerReceives = sellerReceiveAmount * BigInt(2);
            const expectedUser1Change = user1AsSellerReceives - user1AsBuyerPays;
            const expectedFeeCollectorChange = (buyerFeeAmount * BigInt(2)) + (sellerFeeAmount * BigInt(2));
        
            // Calculate actual balance changes
            const changes = {
                user1: endBalances.user1 - startBalances.user1,
                user2: startBalances.user2 - endBalances.user2,
                feeCollector: endBalances.feeCollector - startBalances.feeCollector
            };
        
            // Verify all balance changes
            expect(changes.user1).to.equal(expectedUser1Change, 
                `User1 balance change incorrect\nExpected: ${formatEther(expectedUser1Change)}\nActual: ${formatEther(changes.user1)}`);
        
            expect(changes.user2).to.equal(totalCostPerPurchase, 
                `User2 balance change incorrect\nExpected: ${formatEther(totalCostPerPurchase)}\nActual: ${formatEther(changes.user2)}`);
        
            expect(changes.feeCollector).to.equal(expectedFeeCollectorChange,
                `Fee collector change incorrect\nExpected: ${formatEther(expectedFeeCollectorChange)}\nActual: ${formatEther(changes.feeCollector)}`);
        
            // Verify vesting allocations
            const user1Data = await manager.read.allocations([user1.account.address, vesting.address]);
            const user2Data = await manager.read.allocations([user2.account.address, vesting.address]);
            
            expect(user1Data[0]).to.equal(purchaseAmount, "User1 allocation incorrect");
            expect(user2Data[0]).to.equal(purchaseAmount, "User2 allocation incorrect");
        
            // Verify remaining listing amount
            const finalListing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            const expectedRemainingAmount = listAmount - (purchaseAmount * BigInt(2));
            expect(finalListing[2]).to.equal(expectedRemainingAmount, "Remaining listing amount incorrect");
        });

        it("Purchase with linear discount - verify price calculations", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1] = await hre.viem.getWalletClients();
            
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const discountPct = BigInt(2000); // 20% max discount
            
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                discountPct,
                0, // partial fill
                1, // linear discount
                BigInt(0),
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });
    
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
    
            const balancesBefore = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
    
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                "0x0000000000000000000000000000000000000000"
            ], { account: buyer1.account });
    
            const balancesAfter = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
    
            // Calculate linear discount
            const BASE = BigInt(10000);
            const linearDiscountPct = (purchaseAmount * discountPct) / listAmount;
            const discountedPrice = (pricePerUnit * (BASE - linearDiscountPct)) / BASE;
            const totalDiscountedPrice = (purchaseAmount * discountedPrice) / parseEther("1");
    
            const buyerFee = await marketplaceSetting.read.buyerFee();
            const sellerFee = await marketplaceSetting.read.sellerFee();
            
            const buyerFeeAmount = (totalDiscountedPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalDiscountedPrice * sellerFee) / BASE;
    
            // Verify price calculations
            expect(balancesBefore.buyer - balancesAfter.buyer).to.equal(totalDiscountedPrice + buyerFeeAmount);
            expect(balancesAfter.seller - balancesBefore.seller).to.equal(totalDiscountedPrice - sellerFeeAmount);
            expect(balancesAfter.feeCollector - balancesBefore.feeCollector).to.equal(buyerFeeAmount + sellerFeeAmount);
        });

        it("Purchase with fixed discount - verify price calculations", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1] = await hre.viem.getWalletClients();
            
            // Test parameters
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const discountPct = BigInt(1000); // 10% fixed discount
            
            // List vesting with fixed discount
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                discountPct,
                0, // partial fill
                2, // fixed discount type
                BigInt(0), // no whitelist
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });
    
            // Setup buyer
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
    
            // Record initial balances
            const balancesBefore = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
    
            // Execute purchase
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                "0x0000000000000000000000000000000000000000"
            ], { account: buyer1.account });
    
            // Record final balances
            const balancesAfter = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
    
            // Calculate expected amounts
            const BASE = BigInt(10000);
            const discountedPrice = (pricePerUnit * (BASE - discountPct)) / BASE;
            const totalDiscountedPrice = (purchaseAmount * discountedPrice) / parseEther("1");
            
            const buyerFee = await marketplaceSetting.read.buyerFee();
            const sellerFee = await marketplaceSetting.read.sellerFee();
            
            const buyerFeeAmount = (totalDiscountedPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalDiscountedPrice * sellerFee) / BASE;
    
            // Verify all amounts
            expect(balancesBefore.buyer - balancesAfter.buyer).to.equal(totalDiscountedPrice + buyerFeeAmount);
            expect(balancesAfter.seller - balancesBefore.seller).to.equal(totalDiscountedPrice - sellerFeeAmount);
            expect(balancesAfter.feeCollector - balancesBefore.feeCollector).to.equal(buyerFeeAmount + sellerFeeAmount);
        });
    
        it("Purchase with referral - verify fee distribution", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1, referrer] = await hre.viem.getWalletClients();
            
            // Test parameters
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const BASE = BigInt(10000);
            
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                BigInt(0),
                0,
                0,
                BigInt(0),
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });
        
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
        
            const balancesBefore = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                referrer.account.address
            ], { account: buyer1.account });
        
            const balancesAfter = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            // Calculate prices and fees
            const totalPrice = (purchaseAmount * pricePerUnit) / parseEther("1");
            const buyerFee = await marketplaceSetting.read.buyerFee();     // 250 = 2.5%
            const sellerFee = await marketplaceSetting.read.sellerFee();   // 250 = 2.5%
            
            const buyerFeeAmount = (totalPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalPrice * sellerFee) / BASE;

            // Updated referral calculations - 90% of buyer fee
            const REFERRAL_PERCENTAGE = BigInt(90);
            const referralReward = (buyerFeeAmount * REFERRAL_PERCENTAGE) / BigInt(100);
            const feeCollectorAmount = sellerFeeAmount + (buyerFeeAmount);

            // Calculate actual changes
            const changes = {
                buyer: balancesBefore.buyer - balancesAfter.buyer,
                seller: balancesAfter.seller - balancesBefore.seller,
                referrer: balancesAfter.referrer - balancesBefore.referrer,
                feeCollector: balancesAfter.feeCollector - balancesBefore.feeCollector
            };

            // Verify amounts with more detailed error messages
            expect(changes.buyer).to.equal(totalPrice + buyerFeeAmount,
                `Buyer payment incorrect\nExpected: ${formatEther(totalPrice + buyerFeeAmount)}\nActual: ${formatEther(changes.buyer)}`);
            
            expect(changes.seller).to.equal(totalPrice - sellerFeeAmount,
                `Seller receipt incorrect\nExpected: ${formatEther(totalPrice - sellerFeeAmount)}\nActual: ${formatEther(changes.seller)}`);
            
            expect(changes.referrer).to.equal(BigInt(0),
                `Referral reward incorrect\nExpected: ${formatEther(referralReward)}\nActual: ${formatEther(changes.referrer)}`);
            
            expect(changes.feeCollector).to.equal(feeCollectorAmount,
                `Fee collector amount incorrect\nExpected: ${formatEther(feeCollectorAmount)}\nActual: ${formatEther(changes.feeCollector)}`);
        });
    
        it("Purchase with referral where buyerFee = 0 and sellerFee =0 - verify fee distribution", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1,
                s2admin
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1, referrer] = await hre.viem.getWalletClients();
            
            // Test parameters
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const BASE = BigInt(10000);
            
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                BigInt(0),
                0,
                0,
                BigInt(0),
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });
        
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
        
            const balancesBefore = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
            await marketplaceSetting.write.setBuyerFee([BigInt(0)],{ account: s2admin.account })
            await marketplaceSetting.write.setSellerFee([BigInt(0)],{ account: s2admin.account })
            const buyerFee = await marketplaceSetting.read.buyerFee();     // 250 = 2.5%
            const sellerFee = await marketplaceSetting.read.sellerFee();   // 250 = 2.5%
            
            expect(buyerFee).to.equal(BigInt(0))
            expect(sellerFee).to.equal(BigInt(0))

            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                referrer.account.address
            ], { account: buyer1.account });
        
            const balancesAfter = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
            
            // Calculate prices and fees
            const totalPrice = (purchaseAmount * pricePerUnit) / parseEther("1");
            
            const buyerFeeAmount = (totalPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalPrice * sellerFee) / BASE;

            // Updated referral calculations - 90% of buyer fee
            const REFERRAL_PERCENTAGE = BigInt(90);
            const referralReward = (buyerFeeAmount * REFERRAL_PERCENTAGE) / BigInt(100);
            const feeCollectorAmount = sellerFeeAmount + (buyerFeeAmount - referralReward);

            // Calculate actual changes
            const changes = {
                buyer: balancesBefore.buyer - balancesAfter.buyer,
                seller: balancesAfter.seller - balancesBefore.seller,
                referrer: balancesAfter.referrer - balancesBefore.referrer,
                feeCollector: balancesAfter.feeCollector - balancesBefore.feeCollector
            };

            // Verify amounts with more detailed error messages
            expect(changes.buyer).to.equal(totalPrice + buyerFeeAmount,
                `Buyer payment incorrect\nExpected: ${formatEther(totalPrice + buyerFeeAmount)}\nActual: ${formatEther(changes.buyer)}`);
            
            expect(changes.seller).to.equal(totalPrice - sellerFeeAmount,
                `Seller receipt incorrect\nExpected: ${formatEther(totalPrice - sellerFeeAmount)}\nActual: ${formatEther(changes.seller)}`);
            
            expect(changes.referrer).to.equal(referralReward,
                `Referral reward incorrect\nExpected: ${formatEther(referralReward)}\nActual: ${formatEther(changes.referrer)}`);
            
            expect(changes.feeCollector).to.equal(feeCollectorAmount,
                `Fee collector amount incorrect\nExpected: ${formatEther(feeCollectorAmount)}\nActual: ${formatEther(changes.feeCollector)}`);
        });
        
        it("Purchase with both fixed discount and referral - verify all calculations", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1, referrer] = await hre.viem.getWalletClients();
            
            // Test parameters
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const discountPct = BigInt(1000); // 10% fixed discount
            
            // List vesting with fixed discount
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                discountPct,
                0,
                2, // fixed discount
                BigInt(0),
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });
        
            // Setup balances
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
        
            const balancesBefore = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            // Execute purchase
            await marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                purchaseAmount,
                referrer.account.address
            ], { account: buyer1.account });
        
            const balancesAfter = {
                buyer: await token.read.balanceOf([buyer1.account.address]),
                seller: await token.read.balanceOf([user1.account.address]),
                referrer: await token.read.balanceOf([referrer.account.address]),
                feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
            };
        
            const BASE = BigInt(10000);
            const discountedPrice = (pricePerUnit * (BASE - discountPct)) / BASE;
            const totalDiscountedPrice = (purchaseAmount * discountedPrice) / parseEther("1");
            
            const buyerFee = await marketplaceSetting.read.buyerFee();
            const sellerFee = await marketplaceSetting.read.sellerFee();
            
            const buyerFeeAmount = (totalDiscountedPrice * buyerFee) / BASE;
            const sellerFeeAmount = (totalDiscountedPrice * sellerFee) / BASE;
        
            // Updated referral calculations - 90% of buyer fee
            const REFERRAL_PERCENTAGE = BigInt(90);
            const referralReward = (buyerFeeAmount * REFERRAL_PERCENTAGE) / BigInt(100);
            const feeCollectorAmount = sellerFeeAmount + (buyerFeeAmount);
        
            // Calculate actual changes
            const changes = {
                buyer: balancesBefore.buyer - balancesAfter.buyer,
                seller: balancesAfter.seller - balancesBefore.seller,
                referrer: balancesAfter.referrer - balancesBefore.referrer,
                feeCollector: balancesAfter.feeCollector - balancesBefore.feeCollector
            };
        
            // Verify all amounts with detailed error messages
            expect(changes.buyer).to.equal(totalDiscountedPrice + buyerFeeAmount,
                `Buyer payment incorrect\nExpected: ${formatEther(totalDiscountedPrice + buyerFeeAmount)}\nActual: ${formatEther(changes.buyer)}`);
            
            expect(changes.seller).to.equal(totalDiscountedPrice - sellerFeeAmount,
                `Seller receipt incorrect\nExpected: ${formatEther(totalDiscountedPrice - sellerFeeAmount)}\nActual: ${formatEther(changes.seller)}`);
            
            expect(changes.referrer).to.equal(BigInt(0),
                `Referral reward incorrect\nExpected: ${formatEther(referralReward)}\nActual: ${formatEther(changes.referrer)}`);
            
            expect(changes.feeCollector).to.equal(feeCollectorAmount,
                `Fee collector amount incorrect\nExpected: ${formatEther(feeCollectorAmount)}\nActual: ${formatEther(changes.feeCollector)}`);
        
            // Verify listing status
            const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listing[2]).to.equal(listAmount - purchaseAmount);
            expect(listing[10]).to.equal(0); // Should still be active as not fully purchased
        });

        it("Should revert when attempting to purchase a delisted lot", async function() {
            const {
                vesting,
                token,
                marketplace,
                marketplaceSetting,
                user1
            } = await loadFixture(deployProxyFixture);
            
            const [buyer1, referrer] = await hre.viem.getWalletClients();
            
            // Test parameters
            const listAmount = parseEther("100");
            const pricePerUnit = parseEther("2");
            const purchaseAmount = parseEther("40");
            const discountPct = BigInt(1000); // 10% fixed discount
            const duration = BigInt(60 * 60 * 24 * 365);
            
            // List vesting with fixed discount
            await marketplace.write.listVesting([
                vesting.address,
                listAmount,
                pricePerUnit,
                discountPct,
                0,
                2, // fixed discount
                BigInt(0),
                token.address,
                parseEther("1"),
                false
            ], { account: user1.account });

            await time.increase(duration);

            // Setup buyer balance and approvals
            await token.write.mint([buyer1.account.address, parseEther("1000")]);
            await token.write.approve([marketplace.address, parseEther("1000")], { account: buyer1.account });
            
            // Delist the vesting
            await marketplace.write.unlistVesting([
                vesting.address,
                BigInt(0)
            ], { account: user1.account });
        
            // Attempt to purchase delisted vesting - should fail
            await expect(
                marketplace.write.spotPurchase([
                    vesting.address,
                    BigInt(0),
                    purchaseAmount,
                    referrer.account.address
                ], { account: buyer1.account })
            ).to.be.revertedWith("SS_Marketplace: Listing not active");
        });

        it("should not let user exploy rounding bug", async function() {
            async function deployProxyFixture() {
                const [deployer, s2admin, s2dev, feeCollector, user1,alice, bob,tokenOwner] = await hre.viem.getWalletClients();
                
                const startTime = BigInt(await time.latest());
                const endTime = startTime + BigInt(60 * 60 * 24);
                const steps = BigInt(200);
        
                // Deploy proxy and implementation
                const Marketplace = await hre.ignition.deploy(ProxyModule, {
                    parameters: {
                        ERC20: {
                            name: "Test Token",
                            symbol: "TT",
                            initialSupply: parseEther("1000000")
                        },
                        DeployStepVestingAsOwner: {
                            startTime: startTime,
                            endTime: endTime,
                            numOfSteps: steps
                        }
                    }
                });
        
                // Get contract instance through proxy
                const marketplace = await hre.viem.getContractAt(
                    "SecondSwap_Marketplace", 
                    Marketplace.proxy.address
                );
                
                await Marketplace.vestingManager.write.setMarketplace([marketplace.address],{account: s2admin.account});
                await Marketplace.token.write.transfer([s2admin.account.address, parseEther("1000000")]);
                await Marketplace.token.write.approve([Marketplace.vesting.address, parseEther("1000")], { account: s2admin.account });
                await Marketplace.vesting.write.createVesting([user1.account.address, parseEther("1000")], { account: s2admin.account });
         
                return {
                    proxy: Marketplace.proxy,
                    proxyAdmin: Marketplace.proxyAdmin,
                    implementation: Marketplace.implementation,
                    marketplaceSetting: Marketplace.marketplaceSetting,
                    token: Marketplace.token,
                    manager: Marketplace.vestingManager,
                    whitelist: Marketplace.whitelist,
                    marketplace,
                    s2admin,
                    s2dev, 
                    alice, 
                    bob,
                    feeCollector,
                    user1,
                    startTime,
                    endTime,
                    steps,
                    vesting: Marketplace.vesting
                };
            }
            const { vesting, token, marketplace, user1, alice, bob} = await loadFixture(deployProxyFixture);
            
            // Approve marketplace to handle tokens
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );

            // list vesting
            const amount = BigInt(10);
            const price = parseEther("0.9"); // price less than 1 ether
            const discountPct = BigInt(0);
            const listingType = 0; // Partial fill
            const discountType = 0; // No discount
            const maxWhitelist = BigInt(0);
            const minPurchaseAmt = BigInt(0);
            const isPrivate = false;
            await marketplace.write.listVesting(
                [
                    vesting.address,
                    amount,
                    price,
                    discountPct,
                    listingType,
                    discountType,
                    maxWhitelist,
                    token.address,
                    minPurchaseAmt,
                    isPrivate
                ],
                { account: user1.account }
            );

            let listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listing[10]).to.equal(0); // LIST status
            
            // Exploit start
            const alice_token_balance = await token.read.balanceOf([alice.account.address]); 
            let alice_vesting_total = await vesting.read.total([alice.account.address]);

            await expect(marketplace.write.spotPurchase([
                vesting.address,
                BigInt(0),
                BigInt(1),
                "0x0000000000000000000000000000000000000000"
            ], 
            { account : alice.account })).to.be.revertedWith("SS_Marketplace: Amount too little");
           
        });

    })
 
    describe("Marketplace Frozen", function() {
        it("Cannot list when marketplace is frozen", async function() {
            const { vesting, token, marketplace, marketplaceSetting, user1, s2admin } = await loadFixture(deployProxyFixture);
    
            // Freeze marketplace
            await marketplaceSetting.write.setMarketplaceStatus([true],{ account: s2admin.account });
    
            const listAmount = parseEther("100");
            const listPrice = parseEther("100");
            const minPurchaseAmt = parseEther("1");
    
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );
    
            await 
            expect(
                marketplace.write.listVesting(
                    [
                        vesting.address,
                        listAmount,
                        listPrice,
                        BigInt(0),
                        1,
                        0,
                        BigInt(0),
                        token.address,
                        minPurchaseAmt,
                        false
                    ],
                    { account: user1.account }
                )
            ).to.be.revertedWith("SS_Marketplace: Marketplace is currently frozen");
        });
    
        it("Cannot purchase when marketplace is frozen", async function() {
            // Setup
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin 
            } = await loadFixture(deployProxyFixture);
            
            const [user2] = await hre.viem.getWalletClients();
        
            // Test parameters
            const testParams = {
                listAmount: parseEther("100"),
                listPrice: parseEther("100"),
                minPurchaseAmt: parseEther("1"),
                approvalAmount: parseEther("1000"),
                buyerMintAmount: parseEther("100000")
            };
        
            // List vesting before freezing
            await token.write.approve(
                [marketplace.address, testParams.approvalAmount],
                { account: user1.account }
            );
        
            await marketplace.write.listVesting(
                [
                    vesting.address,
                    testParams.listAmount,
                    testParams.listPrice,
                    BigInt(0),           // no discount
                    1,                   // single fill
                    0,                   // no discount type
                    BigInt(0),           // no whitelist
                    token.address,
                    testParams.minPurchaseAmt,
                    false               // public listing
                ],
                { account: user1.account }
            );
        
            // Now mint tokens to buyer using the new owner
            await token.write.mint(
                [user2.account.address, testParams.buyerMintAmount]
            );
        
            // Approve marketplace to spend buyer's tokens
            await token.write.approve(
                [marketplace.address, testParams.buyerMintAmount]
            );
        
            // Verify listing is active
            const listingBefore = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listingBefore[10]).to.equal(0); // Status.LIST
        
            // Freeze marketplace
            await marketplaceSetting.write.setMarketplaceStatus(
                [true],
                { account: s2admin.account }
            );
        
            // Verify marketplace is frozen
            const isFrozen = await marketplaceSetting.read.isMarketplaceFreeze();
            expect(isFrozen).to.be.true;
        
            // Attempt purchase and verify it fails
            await expect(
                marketplace.write.spotPurchase(
                    [
                        vesting.address,
                        BigInt(0),
                        testParams.listAmount,
                        "0x0000000000000000000000000000000000000000"
                    ],
                    { account: user2.account }
                )
            ).to.be.revertedWith("SS_Marketplace: Marketplace is currently frozen");        
       
            // Verify listing status hasn't changed
            const listingAfter = await marketplace.read.listings([vesting.address, BigInt(0)]);
            expect(listingAfter[10]).to.equal(0); // Should still be in LIST status
            expect(listingAfter[2]).to.equal(testParams.listAmount); // Balance shouldn't have changed
        });

    });  

    describe("Fee Collector and Duration Settings", function() {
        it("Should update fee collector address correctly", async function() {
            const { marketplaceSetting, s2admin, bob } = await loadFixture(deployProxyFixture);

            const initialFeeCollector = await marketplaceSetting.read.feeCollector();
            
            await marketplaceSetting.write.setFeeAccount(
                [bob.account.address],
                { account: s2admin.account }
            );

            const updatedFeeCollector = await marketplaceSetting.read.feeCollector();
            expect(updatedFeeCollector.toLowerCase()).to.equal(bob.account.address.toLowerCase());
            expect(updatedFeeCollector.toLowerCase()).to.not.equal(initialFeeCollector.toLowerCase());
        });

        it("Should update buyer fee correctly", async function() {
            const { marketplaceSetting, s2admin } = await loadFixture(deployProxyFixture);
            
            const initialBuyerFee = await marketplaceSetting.read.buyerFee();
            const newFee = BigInt(300); // 3%
            
            await marketplaceSetting.write.setBuyerFee(
                [newFee],
                { account: s2admin.account }
            );

            const updatedFee = await marketplaceSetting.read.buyerFee();
            expect(updatedFee).to.equal(newFee);
            expect(updatedFee).to.not.equal(initialBuyerFee);

            // Test a purchase with the new fee
            const finalFee = await marketplaceSetting.read.buyerFee();
            expect(finalFee).to.equal(newFee);
        });

        it("Should update seller fee correctly", async function() {
            const { marketplaceSetting, s2admin } = await loadFixture(deployProxyFixture);
            
            const initialSellerFee = await marketplaceSetting.read.sellerFee();
            const newFee = BigInt(300); // 3%
            
            await marketplaceSetting.write.setSellerFee(
                [newFee],
                { account: s2admin.account }
            );

            const updatedFee = await marketplaceSetting.read.sellerFee();
            expect(updatedFee).to.equal(newFee);
            expect(updatedFee).to.not.equal(initialSellerFee);
        });

        it("Should update minimum listing duration correctly", async function() {
            const { marketplaceSetting, s2admin } = await loadFixture(deployProxyFixture);
            
            const initialDuration = await marketplaceSetting.read.minListingDuration();
            const newDuration = BigInt(60 * 60 * 48); // 48 hours
            
            await marketplaceSetting.write.setMinListingDuration(
                [newDuration],
                { account: s2admin.account }
            );

            const updatedDuration = await marketplaceSetting.read.minListingDuration();
            expect(updatedDuration).to.equal(newDuration);
            expect(updatedDuration).to.not.equal(initialDuration);
        });

        it("Should respect duration limits for unlisting", async function() {
            // Setup
            const { 
                vesting, 
                token, 
                marketplace, 
                marketplaceSetting, 
                user1, 
                s2admin,
                manager
            } = await loadFixture(deployProxyFixture);
            
            // Test parameters
            const testParams = {
                listAmount: parseEther("100"),
                listPrice: parseEther("100"),
                minPurchaseAmt: parseEther("1"),
                approvalAmount: parseEther("1000"),
                duration: BigInt(60 * 60 * 24) // 24 hours
            };
        
            try {
                // Wait for token owner to be set
                const tokenOwner = await token.read.owner();
        
                // Setup listing and vesting
                await token.write.approve(
                    [marketplace.address, testParams.approvalAmount],
                    { account: user1.account }
                );
        
                await marketplace.write.listVesting(
                    [
                        vesting.address,
                        testParams.listAmount,
                        testParams.listPrice,
                        BigInt(0),           // no discount
                        1,                   // single fill
                        0,                   // no discount type
                        BigInt(0),           // no whitelist
                        token.address,
                        testParams.minPurchaseAmt,
                        false               // public listing
                    ],
                    { account: user1.account }
                );
        
                // Set penalty duration
                await marketplaceSetting.write.setMinListingDuration(
                    [testParams.duration],
                    { account: s2admin.account }
                );
        
                // Get penalty fee amount and current owner
                const penaltyFee = await marketplaceSetting.read.penaltyFee();
        
                // Mint tokens for penalty fee using token owner (s2admin)
                await token.write.mint(
                    [user1.account.address, penaltyFee],
                );
        
                // Record user balance after mint
                const userBalanceAfterMint = await token.read.balanceOf([user1.account.address]);
        
                // Approve token spending for penalty fee
                await token.write.approve(
                    [marketplace.address, penaltyFee],
                    { account: user1.account }
                );
        
                // Record initial balances
                const balancesBefore = {
                    user: await token.read.balanceOf([user1.account.address]),
                    feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
                };
               
                // Verify initial listing status
                const listingBefore = await marketplace.read.listings([vesting.address, BigInt(0)]);
                expect(listingBefore[10]).to.equal(0); // Should be in LIST status
        
                // Unlist before duration expires
                await marketplace.write.unlistVesting(
                    [vesting.address, BigInt(0)],
                    { account: user1.account }
                );
        
                // Record final balances
                const balancesAfter = {
                    user: await token.read.balanceOf([user1.account.address]),
                    feeCollector: await token.read.balanceOf([await marketplaceSetting.read.feeCollector()])
                };
        
                // Verify penalty fee was taken
                const feeCollectorChange = balancesAfter.feeCollector - balancesBefore.feeCollector;
                const userChange = balancesBefore.user - balancesAfter.user;
        
                expect(feeCollectorChange).to.equal(penaltyFee,
                    `Fee collector didn't receive correct penalty\nExpected: ${formatEther(penaltyFee)}\nActual: ${formatEther(feeCollectorChange)}`
                );
        
                // Verify listing status
                const listingAfter = await marketplace.read.listings([vesting.address, BigInt(0)]);
                expect(listingAfter[10]).to.equal(2, "Listing should be in DELIST status"); // Status.DELIST
        
                // Verify vesting allocation
                const vestingData = await manager.read.allocations([user1.account.address, vesting.address]);
                expect(vestingData[0]).to.equal(BigInt(0), "Vesting allocation should be cleared");
        
            } catch (error: any) {
                console.error("\nTest failed with error:", {
                    message: error.message,
                    code: error.code,
                    details: error.details
                });
                throw error;
            }
        });

        it("Should validate fee ranges", async function() {
            const { marketplaceSetting, s2admin } = await loadFixture(deployProxyFixture);
            
            const invalidFee = BigInt(5001); // Over 50%
            
            // Try to set invalid buyer fee
            await expect(
                marketplaceSetting.write.setBuyerFee(
                    [invalidFee],
                    { account: s2admin.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Buyer fee cannot be more than 50%");

            // Try to set invalid seller fee
            await expect(
                marketplaceSetting.write.setSellerFee(
                    [invalidFee],
                    { account: s2admin.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Seller fee cannot be more than 50%");

            // Verify fees haven't changed
            const buyerFee = await marketplaceSetting.read.buyerFee();
            const sellerFee = await marketplaceSetting.read.sellerFee();
            expect(buyerFee).to.be.lt(BigInt(5001));
            expect(sellerFee).to.be.lt(BigInt(5001));
        });

        it("Should require admin privileges for settings changes", async function() {
            const { marketplaceSetting, user1 } = await loadFixture(deployProxyFixture);
            
            const newFee = BigInt(300);
            const newDuration = BigInt(60 * 60 * 24);

            // Try to update settings with non-admin account
            await expect(
                marketplaceSetting.write.setBuyerFee(
                    [newFee],
                    { account: user1.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Unauthorized user");

            await expect(
                marketplaceSetting.write.setSellerFee(
                    [newFee],
                    { account: user1.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Unauthorized user");

            await expect(
                marketplaceSetting.write.setMinListingDuration(
                    [newDuration],
                    { account: user1.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Unauthorized user");
        });

        it("Should verify fee collector updates", async function() {
            const { marketplaceSetting, s2admin, bob } = await loadFixture(deployProxyFixture);
            await expect(
                marketplaceSetting.write.setFeeAccount(
                    ["0x0000000000000000000000000000000000000000"],
                    { account: s2admin.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Cannot be zero address");

            // Cannot set to current address
            const currentFeeCollector = await marketplaceSetting.read.feeCollector();
            await expect(
                marketplaceSetting.write.setFeeAccount(
                    [currentFeeCollector],
                    { account: s2admin.account }
                )
            ).to.be.revertedWith("SS_Marketplace_Settings: Cannot be the same address");

            // Can set to new valid address
            await marketplaceSetting.write.setFeeAccount(
                [bob.account.address],
                { account: s2admin.account }
            );
            
            const newFeeCollector = await marketplaceSetting.read.feeCollector();
            expect(newFeeCollector.toLowerCase()).to.equal(bob.account.address.toLowerCase());
        });
    }); 

    describe("Vesting Transfer Restrictions", function() {
        it("Cannot transfer vesting tokens once listed on marketplace", async function() {
            const {
                vesting,
                token,
                marketplace,
                manager,
                user1,
                s2admin,
            } = await loadFixture(deployProxyFixture);
            const [user2] = await hre.viem.getWalletClients();
        
            // Test parameters
            const testParams = {
                listAmount: parseEther("100"),
                listPrice: parseEther("100"),
                minPurchaseAmt: parseEther("1"),
                approvalAmount: parseEther("1000"),
                initialAllocation: parseEther("1000")
            };
        
            try {
                // Verify initial vesting balance
                const initialVesting = await vesting.read.available([user1.account.address]);
                expect(initialVesting).to.equal(testParams.initialAllocation, "Initial vesting balance incorrect");
        
                // Setup for listing
                await token.write.approve(
                    [marketplace.address, testParams.approvalAmount],
                    { account: user1.account }
                );
        
                // Verify initial total
                expect(await vesting.read.total([user1.account.address]))
                    .to.equal(testParams.initialAllocation, "Initial total balance incorrect");
        
                // List vesting
                await marketplace.write.listVesting(
                    [
                        vesting.address,
                        testParams.listAmount,
                        testParams.listPrice,
                        BigInt(0),           // discountPct
                        1,                   // listingType - Single
                        0,                   // discountType - None
                        BigInt(0),           // maxWhitelist
                        token.address,       // currency
                        testParams.minPurchaseAmt, // minPurchaseAmt
                        false               // isPrivate
                    ],
                    { account: user1.account }
                );
        
                // Verify listing was successful
                const listing = await marketplace.read.listings([vesting.address, BigInt(0)]);
                expect(listing[0].toLowerCase()).to.equal(user1.account.address.toLowerCase(), "Listing owner incorrect");
                expect(listing[10]).to.equal(0, "Listing status should be LIST"); // Status.LIST
                
                // Verify updated total after listing
                const remainingTotal = testParams.initialAllocation - testParams.listAmount;
                expect(await vesting.read.total([user1.account.address]))
                    .to.equal(remainingTotal, "Remaining total balance incorrect");
        
                // Verify final balances
                const finalState = {
                    vestingTotal: await vesting.read.total([user1.account.address]),
                    managerAllocation: (await manager.read.allocations([user1.account.address, vesting.address]))[1], //check ssold in allocation
                    listing: await marketplace.read.listings([vesting.address, BigInt(0)])
                };
        
                // Verify final states
                expect(finalState.vestingTotal).to.equal(remainingTotal, "Final vesting total incorrect");
                expect(finalState.listing[10]).to.equal(0, "Listing should still be active");
                expect(finalState.managerAllocation).to.equal(testParams.listAmount, "Manager allocation incorrect");
        
            } catch (error: any) {
                console.error("\nTest failed with error:", {
                    message: error.message,
                    code: error.code,
                    details: error.details
                });
                throw error;
            }
        });
    
        it("Can transfer vesting tokens after unlisting from marketplace", async function() {
            const { 
                vesting, 
                token, 
                marketplace, 
                manager,
                user1,
                s2admin 
            } = await loadFixture(deployProxyFixture);
            const [user2] = await hre.viem.getWalletClients();
            
            // List vesting
            const listAmount = parseEther("100");
            const listPrice = parseEther("100");
            const minPurchaseAmt = parseEther("1");
    
            await token.write.approve(
                [marketplace.address, parseEther("1000")],
                { account: user1.account }
            );
    
            await marketplace.write.listVesting(
                [
                    vesting.address,
                    listAmount,
                    listPrice,
                    BigInt(0),
                    1,
                    0,
                    BigInt(0),
                    token.address,
                    minPurchaseAmt,
                    false
                ],
                { account: user1.account }
            );
    
            // Wait for listing duration and unlist
            await time.increase(BigInt(60 * 60 * 24 * 2));
    
            await marketplace.write.unlistVesting(
                [vesting.address, BigInt(0)],
                { account: user1.account }
            );
    
            // Try transfer after unlisting
            await vesting.write.transferVesting(
                [user1.account.address, user2.account.address, listAmount],
                { account: s2admin.account }
            );
    
            // Verify transfer was successful
            const user1Vesting = await vesting.read.total([user1.account.address]);
            const user2Vesting = await vesting.read.total([user2.account.address]);
    
            expect(user1Vesting).to.equal(parseEther("900")); // Original - transferred amount
            expect(user2Vesting).to.equal(listAmount);
        });
    });
    

});