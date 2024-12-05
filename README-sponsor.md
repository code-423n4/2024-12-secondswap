# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```
```
Based is 10000 for Marketplace and vesting manager
```

# Setup and Run Test Script

Follow the steps below to set up and run the test script.

## Prerequisites

- Make sure you have [Node.js](https://nodejs.org/) installed.
- Install [VSCode](https://code.visualstudio.com/) if you haven't already.

## Steps

1. **Open the Project**  
   Open the project folder in VSCode.

2. **Install Packages**  
   In the terminal, execute:

   ```bash
   npm install
    ```
3. Modify the .env.sample with its relevant information and rename it to .env
4. **Run the Test Script**
To execute a specific test case, use the following command in the terminal:
    ```bash
    npx hardhat test <path/to/your/test/file>
    ```
    For example:
    ```bash
    npx hardhat test ./test/Marketplace.test.ts
    ```
**Notes**
- Replace <path/to/your/test/file> with the path to the test file you want to execute.

