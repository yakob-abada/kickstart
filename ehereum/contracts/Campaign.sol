// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract FactoryCampaign {
    address payable [] public deployedCampaigns;

    function createCampaign(uint minContribution) public {
        address newCampaign = address(new Campaign(minContribution, msg.sender));
        deployedCampaigns.push(payable (newCampaign));
    }

    function getDeployedCampaigns() public view returns (address payable[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complete;
        mapping (address => bool)  approvals;
        uint approvalCount;
    }

    address public manager;
    mapping (address => bool) public approvers;
    uint public approverCount;
    uint public minContribution;
    Request[] public requests;


    constructor (uint min, address owner) {
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
        require(approvers[msg.sender]);
        _;
    }

    modifier isNewVoter(uint index) {
        require(!requests[index].approvals[msg.sender]);
        _;
    }

    modifier hasEnoughVotes(uint index) {
        require(requests[index].approvalCount >= approverCount / 2);
        _;
    }

    function contribute() public payable moreThanMinValue {
        approvers[msg.sender] = true;
        approverCount++;
    }

    function createRequest(string memory description, uint value, address payable recipient) public restricted {
        Request storage newRequest = requests.push();
        newRequest.description = description;
        newRequest.value= value;
        newRequest.recipient= recipient;
        newRequest.complete= false;
        newRequest.approvalCount= 0;
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

    function summary() public view returns(uint, uint, uint, uint, address) {
        return (
            minContribution,
            address(this).balance,
            requests.length,
            approverCount,
            manager
        );
    }

    function getRequestsCount() public view returns(uint) {
        return requests.length;
    }
}