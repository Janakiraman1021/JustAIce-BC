        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;

        contract ComplaintRegistry {
            struct Complaint {
                string complaintId;
                string userName;
                string ipfsHash;
            }

            Complaint[] public complaints;

            event ComplaintFiled(string complaintId, string userName, string ipfsHash);

            function addComplaint(string memory _id, string memory _user, string memory _hash) public {
                complaints.push(Complaint(_id, _user, _hash));
                emit ComplaintFiled(_id, _user, _hash);
            }

            function getComplaint(uint index) public view returns (string memory, string memory, string memory) {
                Complaint memory c = complaints[index];
                return (c.complaintId, c.userName, c.ipfsHash);
            }

            function totalComplaints() public view returns (uint) {
                return complaints.length;
            }
        }
