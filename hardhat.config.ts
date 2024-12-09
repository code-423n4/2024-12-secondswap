import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-ignition-viem";
import "hardhat-gas-reporter";
import "hardhat-chai-matchers-viem";
import * as dotenv from "dotenv";
require("hardhat-contract-sizer");

dotenv.config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {    
    hardhat: {
		// 	chains: {
		// 		97: {
		// 			hardforkHistory: {
		// 				london: 44953872,
		// 			},
		// 		},
		// 	},
		// 	forking: {
		// 		url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
		// 		blockNumber: 44953872,
		// 	},
			accounts: {
				count: 200,		
		},
  },
    // These are hardhat node credentials
    // localhost: {
    //   url: "http://127.0.0.1:8545/",
    //   accounts: [`${process.env.PRIVATE_KEY_SSDeployment}`,
    //     `${process.env.PRIVATE_KEY_SSAdmin}`,
    //     `${process.env.PRIVATE_KEY_SSDev}`,
    //     `${process.env.PRIVATE_KEY_FC}`,
    //   ],
    // },
    // sepolia: {
    //   blockGasLimit: 3000000000000,
    //   url: process.env.ETH_URL,
    //   accounts: [`${process.env.PRIVATE_KEY_SSDeployment}`,
    //     `${process.env.PRIVATE_KEY_SSAdmin}`,
    //     `${process.env.PRIVATE_KEY_SSDev}`,
    //     `${process.env.PRIVATE_KEY_FC}`,
    //     ],
    //   allowUnlimitedContractSize: false,
    //   ignition:{
    //     maxFeePerGasLimit: 10_000_000_000n,
    //     maxPriorityFeePerGas: 3_000_000_000n,
    //   }
    // },
  },
  solidity: {
    compilers: [
      { version: "0.8.24",
          settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        }, 
      },
    ],
  },
  etherscan: {
    apiKey: {
      sepolia:`${process.env.SEPOLIA}`
		}
  }
  
};

export default config;
