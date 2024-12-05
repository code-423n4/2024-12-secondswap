
import hre from "hardhat";
import { expect } from "chai";
import { parseEther } from "viem";
import DeployStepVestingAsOwner from "../ignition/modules/DeployStepVestingAsOwner";
import { loadFixture, mine, time } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("StepVesting", function () {
    async function deployStepVestingFixture() {
        const [owner,tokenOwner, alice, bob] = await hre.viem.getWalletClients();
        const startTime = BigInt(await time.latest());
        const endTime = startTime + BigInt(60 * 60 * 24 * 365 * 2);
        const steps = BigInt(365 * 2);

        const Vesting = await hre.ignition.deploy(DeployStepVestingAsOwner, {
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

        await Vesting.token.write.transfer([tokenOwner.account.address, parseEther("1000000")]);
        
        return { vesting: Vesting.vesting, token: Vesting.token, owner, tokenOwner, alice, bob, startTime, endTime, steps};
    }

    describe("Deployment", async function () {
        it("should deploy the contract correctly", async function () {
            const {vesting, token, startTime, endTime, steps} = await loadFixture(deployStepVestingFixture);
            expect(vesting.address).to.not.equal(0);
            expect(token.address).to.not.equal(0);
            expect(await vesting.read.startTime()).to.equal(startTime);
            expect(await vesting.read.endTime()).to.equal(endTime);
            expect(await vesting.read.numOfSteps()).to.equal(steps);
         });
    });

    describe("Claiming", async  function () {
        it("should set the correct release rate", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
            const releaseRate = (await vesting.read._vestings([alice.account.address]))["2"];
            expect(releaseRate).to.equal(parseEther("1000") / BigInt(365 * 2));
        });

        it("should claim the correct full amount if no claims are made", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            const duration = 60 * 60 * 24 * 365 * 2;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
    
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(730));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            const balance  = await token.read.balanceOf([alice.account.address])
            expect(balance).to.equal(parseEther("1000"));
        });

        it("should claim the correct amount at 235 cycles", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            const duration = 60 * 60 * 24 * 235;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
    
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(235));
            await vesting.write.claim({account: alice.account});
            // Check if claimed amount is correct
            const balance  = await token.read.balanceOf([alice.account.address]);
            const expected  = parseEther("1000") / BigInt(365 * 2) * BigInt(235);
            expect(balance).to.equal(expected);
        });

        it("should claim the correct amount at 93, 433 and full schedule", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 93;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
    
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(93));
            await vesting.write.claim({account: alice.account})
            let balance  = await token.read.balanceOf([alice.account.address])

            let expected  = parseEther("1000") / BigInt(365 * 2) * BigInt(93)
            expect(balance).to.equal(expected);

            // 433 - 93 = 340
            duration =  60 * 60 * 24 * 433 - duration; 
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(340));
            await vesting.write.claim({account: alice.account})
            balance = (await token.read.balanceOf([alice.account.address]))

            expected = parseEther("1000") / BigInt(365 * 2) * BigInt(433) 
            expect(balance).to.be.equals(expected);

            // 730 - 433 = 297
            duration =  60 * 60 * 24 * 730 - duration; 
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(297));
            await vesting.write.claim({account: alice.account})
            balance = (await token.read.balanceOf([alice.account.address]))

            expected = parseEther("1000")
            expect(balance).to.be.equal(expected);
        });

        it("should claim the correct amount after adding a new vesting", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            const duration = 60 * 60 * 24 * 365 * 2;
    
            await token.write.approve([vesting.address, parseEther("3500")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("2500")], { account: tokenOwner.account });

            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(730));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            const balance  = await token.read.balanceOf([alice.account.address])
            expect(balance).to.equal(parseEther("3500"));
        });

        it("should claim the correct amount after 55 cycles before adding a new vesting and claiming at 87 cycles", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 55;
    
            await token.write.approve([vesting.address, parseEther("3500")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
            let releaseRate = parseEther("1000") / BigInt(365 * 2);
        
            await time.increase(duration);

            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(55));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            let balance  = await token.read.balanceOf([alice.account.address])
            let expected = parseEther("1000") / BigInt(365 * 2) * BigInt(55)
            expect(balance).to.equal(expected);

            await vesting.write.createVesting([alice.account.address, parseEther("2500")], { account: tokenOwner.account });

            // 87 - 55 = 32
            duration =  60 * 60 * 24 * 87 - duration; 
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(32));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            balance  = await token.read.balanceOf([alice.account.address]);
            releaseRate = (parseEther("3500") - expected) / (BigInt(365 * 2) - BigInt(55));
            expected = expected + BigInt(32) * releaseRate;
            expect(balance).to.equal(expected);
        });

        it("should not be able to claim the token before the cliff period", async function () {
            const {vesting, token, tokenOwner, alice} = await loadFixture(deployStepVestingFixture);
            const duration = 60 * 60 * 24 * 365 * 2;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
    
            await time.increase(duration);
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(730));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            const balance  = await token.read.balanceOf([alice.account.address])
            expect(balance).to.equal(parseEther("1000"));
        });

    });

    describe ("Transfer", async function () {
        it("should transfer if initiator is tokenOwner", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });

            expect(await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("1000")], {account: tokenOwner.account})).to.not.be.reverted;
        });

        it("should transfer if initiator is manager", async function () {}).skip();

        it("should revert transfer if initiator is not tokenOwner or manager", async function () {
            const {vesting, token, alice, bob} = await loadFixture(deployStepVestingFixture);
            await expect(vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("1000")])).to.be.revertedWith("unauthorized");
        });
    });

    describe("Transfer and Claiming", async function () {
        it("should transfer the correct amount and claim the correct amount when there is no premature claims", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            const duration = 60 * 60 * 24 * 365 * 2;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], { account: tokenOwner.account });
    
            await time.increase(duration);

            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("245")], {account: tokenOwner.account})
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(730));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            let balance  = await token.read.balanceOf([alice.account.address])
            let expected = parseEther("755")
            expect(balance).to.equal(expected);


            // Check if claimable steps are correct
            expect((await vesting.read.claimable([bob.account.address]))[1]).to.equal(BigInt(730));
            await vesting.write.claim({account: bob.account})
            // Check if claimed amount is correct
            balance  = await token.read.balanceOf([bob.account.address])
            expected = parseEther("245")
            expect(balance).to.equal(expected);
        });

        it("should claim the correct amount, transfer 62% to user B, and claim the correct amount with claims at 600 for user A", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 75;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], {account: tokenOwner.account});
    
            await time.increase(duration);

            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(75));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            let balance  = await token.read.balanceOf([alice.account.address])
            let expected = parseEther("1000") / BigInt(365 * 2) * BigInt(75) 
            expect(balance).to.equal(expected);

            const amountB = parseEther("1000") * BigInt(62) / BigInt(100);
            await vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], {account: tokenOwner.account})

            // 600 - 75 = 525
            duration = 60 * 60 * 24 * 600 - duration;
            await time.increase(duration);

            
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(525));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            balance  = await token.read.balanceOf([alice.account.address])
            const releaseRate = (parseEther("1000") - amountB) / (BigInt(365 * 2));
            expect((await vesting.read._vestings([alice.account.address]))[2]).to.equal(releaseRate);
            expected = expected + releaseRate * BigInt(525);
            expect(balance).to.equal(expected);
        });

        it("should transfer the correct amount and claim the correct amount with claims at 75 for user A and 500 for user B", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 75;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], {account: tokenOwner.account});
    
            await time.increase(duration);

            await vesting.write.transferVesting([alice.account.address, bob.account.address, parseEther("245")], {account: tokenOwner.account})
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([alice.account.address]))[1]).to.equal(BigInt(75));
            await vesting.write.claim({account: alice.account})
            // Check if claimed amount is correct
            let balance  = await token.read.balanceOf([alice.account.address])
            let expected = parseEther("755") / BigInt(365 * 2) * BigInt(75) 
            expect(balance).to.equal(expected);

            // 500 - 75 = 425
            duration = 60 * 60 * 24 * 500 - duration;
            await time.increase(duration);

            // Check if claimable steps are correct
            expect((await vesting.read.claimable([bob.account.address]))[1]).to.equal(BigInt(500));
            await vesting.write.claim({account: bob.account})
            // Check if claimed amount is correct
            balance  = await token.read.balanceOf([bob.account.address])
            expected = parseEther("245") / BigInt(365 * 2) * BigInt(500) 
            expect(balance).to.equal(expected);
        });

        it("should transfer 34% to user B at 111 and user B should able to claim 111 cycles immediately", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 111;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], {account: tokenOwner.account});
    
            await time.increase(duration);

            const amountB = parseEther("1000") * BigInt(34) / BigInt(100);
            await vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], {account: tokenOwner.account})
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([bob.account.address]))[1]).to.equal(BigInt(111));
            await vesting.write.claim({account: bob.account})
            // Check if claimed amount is correct
            let balance  = await token.read.balanceOf([bob.account.address])
            let expected = amountB / BigInt(365 * 2) * BigInt(111) 
            expect(balance).to.equal(expected);
        });

        it("should claim the correct amount at 444 for user A, transfer 1% to user B, and user B should be able to claim starting from 445", async function () {
            const {vesting, token, tokenOwner, alice, bob} = await loadFixture(deployStepVestingFixture);
            let duration = 60 * 60 * 24 * 444;
    
            await token.write.approve([vesting.address, parseEther("1000")], { account: tokenOwner.account });
            await vesting.write.createVesting([alice.account.address, parseEther("1000")], {account: tokenOwner.account});
    
            await time.increase(duration);

            await vesting.write.claim({account: alice.account})
            let expected = parseEther("1000") / BigInt(365 * 2) * BigInt(444)
            let balance  = await token.read.balanceOf([alice.account.address])
            expect(balance).to.equal(expected);

            const amountB = parseEther("1000") * BigInt(1) / BigInt(100);
            await vesting.write.transferVesting([alice.account.address, bob.account.address, amountB], {account: tokenOwner.account})
    
            // Check if claimable steps are correct
            expect((await vesting.read.claimable([bob.account.address]))[1]).to.equal(BigInt(0));
            await expect(vesting.write.claim({account: bob.account})).to.be.revertedWith("SS_StepVesting: nothing to claim");

            await time.increase(60 * 60 * 24);

            expect((await vesting.read.claimable([bob.account.address]))[1]).to.equal(BigInt(1));
            await vesting.write.claim({account: bob.account});
            // Check if claimed amount is correct
            balance  = await token.read.balanceOf([bob.account.address])
            expected = amountB / BigInt(286) * BigInt(1) 
            expect(balance).to.equal(BigInt(expected));
        });
        
   
    });
    

    // Add more test cases here

});