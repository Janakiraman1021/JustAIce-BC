// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract JustAIceStaking is Ownable {
    uint256 public constant REQUIRED_STAKE = 0.001 ether;
    mapping(address => bool) public hasStaked;

    event Staked(address indexed user, uint256 amount);

    // ✅ Add constructor and pass `initialOwner` to `Ownable`
    constructor(address initialOwner) Ownable(initialOwner) {}

    function stake() external payable {
        require(msg.value >= REQUIRED_STAKE, "Stake must be at least 0.001 ETH");
        require(!hasStaked[msg.sender], "Already staked");

        hasStaked[msg.sender] = true;
        emit Staked(msg.sender, msg.value);
    }

    function withdraw(address payable recipient, uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    receive() external payable {}
}