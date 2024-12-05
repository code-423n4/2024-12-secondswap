
import hre, { artifacts, viem }  from "hardhat";
import ERC20 from "../ignition/modules/ERC20";
import { expect } from "chai";
import { parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

describe("TestToken", function () {
    async function deployERC20Fixture() {
        const testToken = await hre.ignition.deploy(ERC20, {
            parameters: {
                ERC20: {
                    name: "Test Token",
                    symbol: "TT",
                    initialSupply: parseEther("1000000"),
                }
            },
            
        });
        return testToken.token;
    }

    it("should deploy the contract correctly", async function () {
       const token = await loadFixture(deployERC20Fixture);
        expect(token.address).to.not.equal(0);
    });

    // it("should have correct initial values", async function () {
    //     const name = await testToken.name();
    //     const symbol = await testToken.symbol();
    //     const decimals = await testToken.decimals();

    //     expect(name).to.equal("Test Token");
    //     expect(symbol).to.equal("TT");
    //     expect(decimals).to.equal(18);
    // });

    // Add more test cases here

});