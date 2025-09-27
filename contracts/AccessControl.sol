// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AccessControl for BlockSentinel
/// @notice Manages admin and authorized roles for secure evidence operations
contract AccessControl {
    address public admin;
    mapping(address => bool) public authorized;

    /// @dev Emitted when admin is changed
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    /// @dev Emitted when a user is added as authorized
    event AuthorizedAdded(address indexed user, address indexed addedBy);

    /// @dev Emitted when a user is removed from authorized list
    event AuthorizedRemoved(address indexed user, address indexed removedBy);

    /// @notice Initializes the admin on contract deployment
    constructor() {
        admin = msg.sender;
        emit AdminChanged(address(0), msg.sender);
    }

    /// @dev Restricts function to admin only
    modifier onlyAdmin() {
        require(msg.sender == admin, "AccessControl: Not admin");
        _;
    }

    /// @dev Restricts function to authorized users only
    modifier onlyAuthorized() {
        require(authorized[msg.sender], "AccessControl: Not authorized");
        _;
    }

    /// @notice Adds an authorized user
    /// @param user Address to be authorized
    function addAuthorized(address user) external onlyAdmin {
        require(user != address(0), "AccessControl: Zero address");
        require(!authorized[user], "AccessControl: Already authorized");
        authorized[user] = true;
        emit AuthorizedAdded(user, msg.sender);
    }

    /// @notice Removes an authorized user
    /// @param user Address to be removed
    function removeAuthorized(address user) external onlyAdmin {
        require(user != address(0), "AccessControl: Zero address");
        require(authorized[user], "AccessControl: Not authorized");
        authorized[user] = false;
        emit AuthorizedRemoved(user, msg.sender);
    }

    /// @notice Checks if a user is authorized
    /// @param user Address to check
    /// @return Boolean indicating authorization status
    function isAuthorized(address user) external view returns (bool) {
        return authorized[user];
    }

    /// @notice Allows changing admin if needed (optional for upgrades)
    /// @param newAdmin New admin address
    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "AccessControl: Zero address");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }
}
