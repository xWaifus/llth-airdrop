//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LLTH is ERC20, Ownable {
    mapping(address => bool) public managers;

    constructor() ERC20("mockLLTH", "ML") {
        managers[msg.sender] = true;
    }

    modifier managerOnly() {
        require(managers[msg.sender], "Not a manager");
        _;
    }

    function setManager(address manager, bool state) external onlyOwner {
        managers[manager] = state;
    }

    function mint(address user, uint256 amount) external managerOnly {
        _mint(user, amount);
    }

    function burn(address user, uint256 amount) external onlyOwner {
        _burn(user, amount);
    }

    function getManager(address manager) external view returns (bool) {
        return managers[manager];
    }
}