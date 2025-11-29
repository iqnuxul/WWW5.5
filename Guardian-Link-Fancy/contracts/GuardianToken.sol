// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GuardianToken is ERC20 {
    address public owner;

    constructor() ERC20("GuardianLink Token", "GLT") {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 初始给部署者100万GLT
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }
}