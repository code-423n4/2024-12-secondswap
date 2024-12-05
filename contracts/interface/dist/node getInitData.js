const { encodeFunctionData, parseAbi } = require('viem')

// Define the ABI for the initialize function
const abi = parseAbi([
  'function initialize(address _vestingManager, address _whitelist, address _s2admin, address _s2dev, address _tokenAddress)'
])

// Define your parameters
const vestingManager = '0x809e47A495D6aD2F995721e7e9112bED75AEC373'
const whitelistDeployer = '0x9187350A5C8badC989dEe49888F1d8dA5FD90a84'
const s2admin = '0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5'
const s2dev = '0xF206fdf2ECC68F5B9a3b70272E9629c2869c1Cd5'
const tokenAddress = '0x89Aad8E9d593F1879bCC4e59C06C6892ff9cD0f3'

// Encode the function call
const initData = encodeFunctionData({
  abi,
  functionName: 'initialize',
  args: [vestingManager, whitelistDeployer, s2admin, s2dev, tokenAddress]
})

console.log('initData:', initData)