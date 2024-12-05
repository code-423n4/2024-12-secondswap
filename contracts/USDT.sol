// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken1 is ERC20 {
    constructor() ERC20("Tothor", "USDT") {
        _mint(msg.sender, 10000000000000000 ether);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
