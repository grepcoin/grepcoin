// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

/**
 * @title GrepToken
 * @dev ERC-20 token for the GrepCoin AI Evolution Economy
 *
 * DEFLATIONARY MODEL - Fixed supply, no minting after deployment
 *
 * Total Supply: 500,000,000 GREP (500 million) - ALL minted at deployment
 *
 * Distribution (handled off-chain via transfers):
 * - 40% (200M) Ecosystem & Rewards
 * - 20% (100M) Liquidity Pool
 * - 15% (75M)  Team & Founders (4-year vest)
 * - 15% (75M)  Treasury
 * - 10% (50M)  Early Supporters
 *
 * Burns occur from:
 * - AI Evolution votes (all voted tokens burned)
 * - Marketplace fees (2.5%)
 * - Tournament entries (10%)
 * - Achievement mints (10 GREP)
 * - Guild creation (500 GREP)
 *
 * Voting: Uses ERC20Votes for checkpoint-based voting power tracking.
 * Users must delegate to themselves or others to activate voting power.
 */
contract GrepToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable, Pausable {
    uint256 public constant TOTAL_SUPPLY = 500_000_000 * 10**18; // 500 million tokens - FIXED

    // Track total burned for transparency
    uint256 public totalBurned;

    // Addresses authorized to burn on behalf of users (evolution contract, marketplace)
    mapping(address => bool) public burners;

    event BurnerAdded(address indexed burner);
    event BurnerRemoved(address indexed burner);
    event TokensBurnedFor(address indexed from, uint256 amount, string reason);

    constructor() ERC20("GrepCoin", "GREP") ERC20Permit("GrepCoin") Ownable(msg.sender) {
        // Mint entire fixed supply to deployer
        // Distribution to different allocations handled via transfers
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    modifier onlyBurner() {
        require(burners[msg.sender] || msg.sender == owner(), "Not authorized to burn");
        _;
    }

    /**
     * @dev Add a burner (evolution contract, marketplace, etc.)
     */
    function addBurner(address burner) external onlyOwner {
        require(burner != address(0), "Invalid burner address");
        burners[burner] = true;
        emit BurnerAdded(burner);
    }

    /**
     * @dev Remove a burner
     */
    function removeBurner(address burner) external onlyOwner {
        burners[burner] = false;
        emit BurnerRemoved(burner);
    }

    /**
     * @dev Burn tokens from a user (requires approval)
     * Used by evolution voting, marketplace, etc.
     */
    function burnFrom(address account, uint256 amount) public virtual override {
        super.burnFrom(account, amount);
        totalBurned += amount;
    }

    /**
     * @dev Burn tokens with a reason (for tracking)
     */
    function burnWithReason(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurnedFor(msg.sender, amount, reason);
    }

    /**
     * @dev Burn tokens from user with reason (requires approval)
     * Called by authorized burner contracts
     */
    function burnFromWithReason(address account, uint256 amount, string calldata reason) external onlyBurner {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
        totalBurned += amount;
        emit TokensBurnedFor(account, amount, reason);
    }

    /**
     * @dev Override burn to track total burned
     */
    function burn(uint256 amount) public virtual override {
        super.burn(amount);
        totalBurned += amount;
    }

    /**
     * @dev Get current circulating supply (total - burned)
     */
    function circulatingSupply() external view returns (uint256) {
        return TOTAL_SUPPLY - totalBurned;
    }

    /**
     * @dev Get burn percentage (basis points, 100 = 1%)
     */
    function burnPercentage() external view returns (uint256) {
        return (totalBurned * 10000) / TOTAL_SUPPLY;
    }

    /**
     * @dev Pause all token transfers (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override _update to add pause functionality and voting checkpoints
     */
    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Votes) whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @dev Override nonces for ERC20Permit and ERC20Votes compatibility
     */
    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
