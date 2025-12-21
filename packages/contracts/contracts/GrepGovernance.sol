// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GrepGovernance
 * @dev Governance contract with checkpoint-based voting to prevent flash loan attacks.
 * Voting power is determined at the block when the proposal was created, not at vote time.
 */
contract GrepGovernance is Ownable, ReentrancyGuard {
    IVotes public grepToken;

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_PROPOSAL_THRESHOLD = 10000 * 10**18; // 10,000 GREP to propose
    uint256 public constant QUORUM_PERCENTAGE = 4; // 4% of total supply

    enum ProposalState { Pending, Active, Succeeded, Defeated, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 snapshotBlock;  // Block number for voting power snapshot (prevents flash loans)
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votePower;
    }

    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed id, address proposer, string title, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCancelled(uint256 indexed id);

    constructor(address _grepToken) Ownable(msg.sender) {
        grepToken = IVotes(_grepToken);
    }

    /**
     * @dev Create a new proposal. Voting power is snapshotted at the current block.
     * Proposer must have at least MIN_PROPOSAL_THRESHOLD voting power (delegated tokens).
     */
    function propose(string calldata title, string calldata description) external returns (uint256) {
        // Check voting power (must delegate to self to have voting power)
        uint256 proposerVotes = grepToken.getVotes(msg.sender);
        require(proposerVotes >= MIN_PROPOSAL_THRESHOLD, "Insufficient voting power to propose");

        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.id = proposalCount;
        p.proposer = msg.sender;
        p.title = title;
        p.description = description;
        p.startTime = block.timestamp;
        p.endTime = block.timestamp + VOTING_PERIOD;
        p.snapshotBlock = block.number;  // Capture snapshot for voting power

        emit ProposalCreated(proposalCount, msg.sender, title, p.startTime, p.endTime);
        return proposalCount;
    }

    /**
     * @dev Cast a vote on a proposal.
     * Voting power is based on the snapshot block when the proposal was created,
     * preventing flash loan attacks where someone borrows tokens just to vote.
     */
    function vote(uint256 proposalId, bool support) external nonReentrant {
        Proposal storage p = proposals[proposalId];
        require(p.id != 0, "Proposal does not exist");
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "Voting not active");
        require(!p.hasVoted[msg.sender], "Already voted");

        // Get voting power at the proposal's snapshot block (prevents flash loans)
        uint256 votes = grepToken.getPastVotes(msg.sender, p.snapshotBlock);
        require(votes > 0, "No voting power at snapshot");

        p.hasVoted[msg.sender] = true;
        p.votePower[msg.sender] = votes;

        if (support) {
            p.forVotes += votes;
        } else {
            p.againstVotes += votes;
        }

        emit VoteCast(proposalId, msg.sender, support, votes);
    }

    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        Proposal storage p = proposals[proposalId];
        require(p.id != 0, "Proposal does not exist");

        if (p.cancelled) return ProposalState.Cancelled;
        if (p.executed) return ProposalState.Executed;
        if (block.timestamp <= p.endTime) return ProposalState.Active;

        uint256 totalVotes = p.forVotes + p.againstVotes;
        // Use total supply at snapshot block for consistent quorum calculation
        uint256 snapshotSupply = grepToken.getPastTotalSupply(p.snapshotBlock);
        uint256 quorum = (snapshotSupply * QUORUM_PERCENTAGE) / 100;

        if (totalVotes < quorum) return ProposalState.Defeated;
        if (p.forVotes > p.againstVotes) return ProposalState.Succeeded;
        return ProposalState.Defeated;
    }

    function execute(uint256 proposalId) external onlyOwner {
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(msg.sender == p.proposer || msg.sender == owner(), "Not authorized");
        require(!p.executed, "Already executed");
        p.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    function getVotes(uint256 proposalId) external view returns (uint256 forVotes, uint256 againstVotes) {
        Proposal storage p = proposals[proposalId];
        return (p.forVotes, p.againstVotes);
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }
}
