// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract TestToken is ERC20Upgradeable, OwnableUpgradeable {
    constructor(string memory _name, string memory _symbol, uint initialSupply) {
        initialize(_name, _symbol, initialSupply);
    }

    function initialize(string memory _name, string memory _symbol, uint initialSupply) internal initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init(msg.sender);
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
