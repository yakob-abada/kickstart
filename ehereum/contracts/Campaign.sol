// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.4.17;

contract FactoryCampaign {
    address[] public deployedCampaigns;

    function createCampaign(uint minContribution) public {
        address newCampaign = address(new Campaign(minContribution, msg.sender));
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        mapping (address => bool)  approvals;
        uint approvalCount;
    }

    address public  manager;
    mapping (address => bool) public  approvers;
    uint private approverCount;

    uint public minContribution;
    Request[] public  requests;


    function Campaign(uint min, address owner) public {
        manager = owner;
        minContribution = min;
    }

    modifier moreThanMinValue {
        require(msg.value > minContribution);
        _;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _; // it take logic of called functions and spelled it here.
    }

    modifier isApprover {
        require(approvers[msg.sender] == true);
        _;
    }

    modifier isNewVoter(uint index) {
        require(!requests[index].approvals[msg.sender]);
        _;
    }

    modifier hasEnoughVotes(uint index) {
        require(approverCount / 2 > requests[index].approvalCount);
        _;
    }

    function contribute() public payable moreThanMinValue {
        approvers[msg.sender] = true;
        approverCount++;
    }

    function createRequest(string memory description, uint value, address recipient) public restricted {
        Request storage newRequest = requests[0];
        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = recipient;
        newRequest.approvalCount = 0;
    }

    function vote(uint index, bool approve) public isApprover isNewVoter(index) {
        Request storage votedRequest = requests[index];
        votedRequest.approvals[msg.sender] = approve;

        if (approve) {
            votedRequest.approvalCount++;
        }
    }

    function finalizeRequest(uint index) public restricted hasEnoughVotes(index) {
        Request storage votedRequest = requests[index];
        require(!votedRequest.complete);

        votedRequest.recipient.transfer(votedRequest.value);
        votedRequest.complete = true;
    }
}