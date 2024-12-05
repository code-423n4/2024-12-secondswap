
import hre from "hardhat";
import { expect } from "chai";
import { parseEther } from "viem";
import DeployStepVestingAsOwner from "../ignition/modules/DeployStepVestingAsOwner";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import SetVestingManagerSettings from "../ignition/modules/SetVestingManagerSettings";
import { sendTransaction } from "viem/_types/actions/wallet/sendTransaction";

describe("VestingManager", function () {
    async function deployStepVestingFixture() {
        const [tokenOwner, owner, alice, bob, marketPlaceholder] = await hre.viem.getWalletClients();
        const startTime = BigInt(await time.latest());
        const endTime = startTime + BigInt(60 * 60 * 24 * 1000);
        const steps = BigInt(200);

        const Manager = await hre.ignition.deploy(SetVestingManagerSettings, {
            parameters: {
                ERC20: {
                    name: "Test Token",
                    symbol: "TT",
                    initialSupply: parseEther("1000000"),
                },
                DeployStepVestingAsOwner: {
                    startTime: startTime,
                    endTime: endTime,
                    numOfSteps: steps,
                },
            }, 
        });

        // Get contract instance through proxy
        const manager = await hre.viem.getContractAt(
            "SecondSwap_VestingManager", 
            Manager.manager.address
        );

        await Manager.manager.write.setMarketplace([marketPlaceholder.account.address],{account:owner.account });
        await Manager.token.write.transfer([owner.account.address, parseEther("1000000")]);
        await Manager.token.write.approve([Manager.vesting.address, parseEther("1000")], { account: owner.account });
        await Manager.vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: owner.account });

        return { vesting: Manager.vesting, token: Manager.token, owner, tokenOwner, alice, bob, marketPlaceholder,startTime, endTime, steps, manager: manager };
    }

    describe("Deployment", async function () {
        it("should deploy the contract correctly", async function () {
            const {vesting, token, startTime, endTime, steps, manager} = await loadFixture(deployStepVestingFixture);
            expect(vesting.address).to.not.equal(0);
            expect(token.address).to.not.equal(0);
            expect(await vesting.read.startTime()).to.equal(startTime);
            expect(await vesting.read.endTime()).to.equal(endTime);
            expect(await vesting.read.numOfSteps()).to.equal(steps);
            expect(await vesting.read.manager()).to.equal(manager.address);

            const settings = await manager.read.vestingSettings([vesting.address]);
            expect((settings)[0]).to.equal(true)
            expect((settings)[1]).to.equal(2000)
         });
    });

    describe("List", async function () {
        it("should revert if the caller is not the marketplace", async function () {
            const {vesting, alice, manager} = await loadFixture(deployStepVestingFixture);

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("1")])).to.be.revertedWith("SS_VestingManager: caller is not marketplace");
        });

        it("should record the correct sold amount and transferred the right amount to manager address", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("200")], { account: marketPlaceholder.account });

            const allocs = await manager.read.allocations([alice.account.address, vesting.address])
            expect(allocs[0]).to.equal(parseEther("0"));
            expect(allocs[1]).to.equal(parseEther("200"));
            expect((await vesting.read.available([manager.address]))).to.equal(parseEther("200"));
        });

        it("should revert if the sell limit is hit in the same transaction", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("201")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: cannot list more than max sell percent");
        });

        it("should revert if the sell limit is hit in separate transactions", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("199")], { account: marketPlaceholder.account });

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("2")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: cannot list more than max sell percent");
        });

        it("should revert if there is insufficient available allocation (claimed)", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await time.increase(60 * 60 * 24 * 300); // 300 days 
            await vesting.write.claim({ account: alice.account });

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("701")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: insufficient availablility");
        });

        it("should revert if there is insufficient available allocation (transfer)", async function () {
            const {vesting, tokenOwner,owner, alice, bob, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("800")], {account: owner.account});

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("400")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: insufficient availablility");
        }); 

        it("should use the correct sell limit when listing 3 times", async function () {
            const {vesting, tokenOwner, alice, bob, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("100")], { account: marketPlaceholder.account });
            
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("50")], { account: marketPlaceholder.account })).to.not.be.reverted;
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("50")], { account: marketPlaceholder.account })).to.not.be.reverted;

            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("1")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: cannot list more than max sell percent");
        }); 
    });

    describe("Unlist", async function () {
        it("should revert if the caller is not the marketplace", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await expect(manager.write.unlistVesting([alice.account.address, vesting.address, parseEther("1")])).to.be.revertedWith("SS_VestingManager: caller is not marketplace");
        });

        it("should update the correct sold amount and transfer the right amount back", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("133")], { account: marketPlaceholder.account });
            await manager.write.unlistVesting([alice.account.address, vesting.address, parseEther("98")], { account: marketPlaceholder.account });

            const allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("0"));
            expect(allocs[1]).to.equal(parseEther("35"));

            expect(await vesting.read.available([manager.address])).to.equal(parseEther("35"));
            expect(await vesting.read.available([alice.account.address])).to.equal(parseEther("965"));
        });

        it("should revert if unlist amount is more than sold amount", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("56")], { account: marketPlaceholder.account });
            await expect(manager.write.unlistVesting([alice.account.address, vesting.address, parseEther("57")], { account: marketPlaceholder.account })).to.be.reverted;
        });
    });

    describe("Complete purchase", async function () {
        it("should revert if the caller is not the marketplace", async function () {
            const {vesting, alice, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await expect(manager.write.completePurchase([alice.account.address, vesting.address, parseEther("1")])).to.be.revertedWith("SS_VestingManager: caller is not marketplace");
        });

        it("should transfer the correct amount to the buyer and update the sold amount", async function () {
            const {vesting, alice, bob, manager, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("200")], { account: marketPlaceholder.account });
            await manager.write.completePurchase([bob.account.address, vesting.address,parseEther("20")], { account: marketPlaceholder.account });

            let allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("0"));
            expect(allocs[1]).to.equal(parseEther("200"));

            allocs = await manager.read.allocations([bob.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("20"));
            expect(allocs[1]).to.equal(parseEther("0"));

            expect(await vesting.read.available([manager.address])).to.equal(parseEther("180"));
            expect(await vesting.read.available([bob.account.address])).to.equal(parseEther("20"));            
        });
    });

    describe("List, Purchase and Transfer", async function () {
        it("should use the correct sell limit when listing, purchasing and listing again", async function () {
            const {vesting, alice, bob, manager, tokenOwner,owner, token, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await token.write.approve([vesting.address, parseEther("5000")], { account: owner.account });
            await vesting.write.createVesting([bob.account.address, parseEther("5000")], { account: owner.account });
            await manager.write.listVesting([bob.account.address, vesting.address, parseEther("400")], { account: marketPlaceholder.account });

            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("200")], { account: marketPlaceholder.account });
            await manager.write.completePurchase([alice.account.address, vesting.address,parseEther("400")], { account: marketPlaceholder.account });

            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("400")], { account: marketPlaceholder.account })).to.not.be.reverted;

            // let allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            // expect(allocs[0]).to.equal(parseEther("0"));
            // expect(allocs[1]).to.equal(parseEther("200"));
        });

        it("should use the correct sell limit when listing, purchasing and listing again (purchase amount > original alloc)", async function () {
            const {vesting, alice, bob, manager, tokenOwner,owner, token, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            // Create vesting for Bob and remove 900 from Alice's allocation
            await token.write.approve([vesting.address, parseEther("9000")], { account: owner.account });
            await vesting.write.createVesting([bob.account.address, parseEther("9000")], { account: owner.account });
            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("900")], { account: owner.account });
            
            await manager.write.listVesting([bob.account.address, vesting.address, parseEther("1000")], { account: marketPlaceholder.account });
            // Create listing for Alice (20% of 100)
            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("20")], { account: marketPlaceholder.account });
            // Alice buys 500 from Bob's listing
            await manager.write.completePurchase([alice.account.address, vesting.address,parseEther("500")], { account: marketPlaceholder.account });

            let allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("500"));
            expect(allocs[1]).to.equal(parseEther("20"));
            // Transfer Alice's 500 to Bob
            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("500")], { account: owner.account });
            // Alice should be able to list whatever she has left that is less than 500
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("80")], { account: marketPlaceholder.account })).to.not.be.reverted;

        })   
        
        it("should use the correct sell limit when listing, purchasing and listing again (purchase amount > original alloc, sold amount > purchase amount)", async function () {
            const {vesting, alice, bob, manager, tokenOwner,owner, token, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            // Create vesting for Bob and remove 900 from Alice's allocation
            await token.write.approve([vesting.address, parseEther("9000")], { account: owner.account });
            await vesting.write.createVesting([bob.account.address, parseEther("9000")], { account: owner.account });
            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("900")], { account: owner.account });
            
            await manager.write.listVesting([bob.account.address, vesting.address, parseEther("1000")], { account: marketPlaceholder.account });
            // Create listing for Alice (20% of 100)
            await manager.write.listVesting([alice.account.address, vesting.address, parseEther("20")], { account: marketPlaceholder.account });
            // Alice buys 500 from Bob's listing
            await manager.write.completePurchase([alice.account.address, vesting.address,parseEther("500")], { account: marketPlaceholder.account });

            let allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("500"));
            expect(allocs[1]).to.equal(parseEther("20"));
            // Alice list everything that was bought (500)
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("500")], { account: marketPlaceholder.account })).to.not.be.reverted;
            // Transfer 200 from Bob to Alice
            await vesting.write.transferVesting([bob.account.address, alice.account.address, parseEther("200")], { account: owner.account });
            // Alice should only be able to list 40 (20% of the 200) 
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("40")], { account: marketPlaceholder.account })).to.not.be.reverted;
            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("1")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: cannot list more than max sell percent");
        })   

        it("should use the correct sell limit when listing, purchasing and listing again (purchase amount > original alloc + sold amount)", async function () {
            const {vesting, alice, bob, manager, tokenOwner,owner, token, marketPlaceholder} = await loadFixture(deployStepVestingFixture);

            await token.write.approve([vesting.address, parseEther("9000")], { account: owner.account });
            await vesting.write.createVesting([bob.account.address, parseEther("9000")], { account: owner.account });
            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("900")], { account: owner.account });
            
            await manager.write.listVesting([bob.account.address, vesting.address, parseEther("1000")], { account: marketPlaceholder.account });

            // Alice buys 500 from Bob's listing
            await manager.write.completePurchase([alice.account.address, vesting.address,parseEther("500")], { account: marketPlaceholder.account });

            let allocs = await manager.read.allocations([alice.account.address, vesting.address]);
            expect(allocs[0]).to.equal(parseEther("500"));
            expect(allocs[1]).to.equal(parseEther("0"));

            // Transfer 300 from Alice to Bob
            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("300")], { account: owner.account });
            // Alice should be able to list whatever she has left that is less than 500
            expect(await manager.write.listVesting([alice.account.address, vesting.address, parseEther("300")], { account: marketPlaceholder.account })).to.not.be.reverted;
            // Alice sell limit is actually 500 but she only has 300 left
            await expect(manager.write.listVesting([alice.account.address, vesting.address, parseEther("1")], { account: marketPlaceholder.account })).to.be.revertedWith("SS_VestingManager: insufficient availablility");
        })  
    // Add more test cases here
    });
});
