// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AccessControl {
    address public admin;
    mapping(address => bool) public authorized;

    modifier onlyAdmin() {
        require(msg.sender == admin, "AccessControl: Only admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorized[msg.sender], "AccessControl: Not authorized");
        _;
    }

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event AuthorizedAdded(address indexed user, address indexed addedBy);
    event AuthorizedRemoved(address indexed user, address indexed removedBy);

    constructor() {
        admin = msg.sender;
    }

    function addAuthorized(address user) external onlyAdmin {
        require(user != address(0), "AccessControl: zero address");
        authorized[user] = true;
        emit AuthorizedAdded(user, msg.sender);
    }

    function removeAuthorized(address user) external onlyAdmin {
        require(user != address(0), "AccessControl: zero address");
        authorized[user] = false;
        emit AuthorizedRemoved(user, msg.sender);
    }

    function isAuthorized(address user) external view returns (bool) {
        return authorized[user];
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "AccessControl: zero address");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }
}

contract EvidenceChainV2 is AccessControl {
    struct EvidenceVersion {
        string ipfsHash;
        uint256 timestamp;
    }

    struct Evidence {
        uint256 complaintId;
        address registrant; // original registrant (user)
        address uploadedBy;
        bool deleted;
        EvidenceVersion[] versions;
    }

    Evidence[] public evidences;
    mapping(uint256 => uint256[]) public complaintToEvidenceIndices;

    event EvidenceCreated(uint256 indexed evidenceIndex, uint256 indexed complaintId, string ipfsHash, address uploadedBy);
    event EvidenceUpdated(uint256 indexed evidenceIndex, uint256 versionNumber, string newIpfsHash, address updatedBy);
    event EvidenceDeleted(uint256 indexed evidenceIndex, address deletedBy);

    function addEvidence(uint256 complaintId, string memory ipfsHash, address registrant) external onlyAuthorized {
        require(complaintId > 0, "EvidenceChain: Invalid complaintId");
        require(bytes(ipfsHash).length > 0, "EvidenceChain: Empty IPFS hash");
        require(registrant != address(0), "EvidenceChain: Invalid registrant");

        Evidence storage e = evidences.push();
        e.complaintId = complaintId;
        e.uploadedBy = msg.sender;
        e.registrant = registrant;
        e.versions.push(EvidenceVersion(ipfsHash, block.timestamp));

        uint256 index = evidences.length - 1;
        complaintToEvidenceIndices[complaintId].push(index);

        emit EvidenceCreated(index, complaintId, ipfsHash, msg.sender);
    }

    function updateEvidence(uint256 index, string memory newIpfsHash) external onlyAuthorized {
        require(index < evidences.length, "EvidenceChain: Invalid index");
        require(bytes(newIpfsHash).length > 0, "EvidenceChain: Empty IPFS hash");
        Evidence storage e = evidences[index];
        require(!e.deleted, "EvidenceChain: Cannot update deleted");

        e.versions.push(EvidenceVersion(newIpfsHash, block.timestamp));

        emit EvidenceUpdated(index, e.versions.length - 1, newIpfsHash, msg.sender);
    }

    function deleteEvidence(uint256 index) external onlyAuthorized {
        require(index < evidences.length, "EvidenceChain: Invalid index");
        Evidence storage e = evidences[index];
        require(!e.deleted, "EvidenceChain: Already deleted");

        e.deleted = true;

        emit EvidenceDeleted(index, msg.sender);
    }

    // Read by authorized OR registrant
    function getEvidence(uint256 index) external view returns (
        uint256 complaintId,
        address uploadedBy,
        address registrant,
        bool deleted,
        EvidenceVersion[] memory versions
    ) {
        require(index < evidences.length, "EvidenceChain: Invalid index");
        Evidence storage e = evidences[index];
        require(
            msg.sender == e.registrant || authorized[msg.sender],
            "EvidenceChain: Not authorized to view"
        );

        return (
            e.complaintId,
            e.uploadedBy,
            e.registrant,
            e.deleted,
            e.versions
        );
    }

    // Get all evidence indices for a complaint
    function getComplaintEvidenceIndices(uint256 complaintId) external view returns (uint256[] memory) {
        return complaintToEvidenceIndices[complaintId];
    }

    // Get total number of evidence records
    function getEvidenceCount() external view returns (uint256) {
        return evidences.length;
    }
}
