// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GrepToken
 * @dev ERC-20 token for the GrepCoin Arcade ecosystem
 *
 * Total Supply: 1,000,000,000 GREP (1 billion)
 * - 40% (400M) to deployer for liquidity and team
 * - 30% (300M) reserved for staking rewards
 * - 20% (200M) reserved for gameplay rewards
 * - 10% (100M) reserved for airdrops and marketing
 */
contract GrepToken is ERC20, ERC20Burnable, ERC20Permit, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens

    // Addresses that can mint (staking pool, rewards distributor)
    mapping(address => bool) public minters;

    // Track total minted for each purpose
    uint256 public stakingRewardsMinted;
    uint256 public gameplayRewardsMinted;
    uint256 public airdropsMinted;

    // Caps for each category
    uint256 public constant STAKING_REWARDS_CAP = 300_000_000 * 10**18;  // 300M
    uint256 public constant GAMEPLAY_REWARDS_CAP = 200_000_000 * 10**18; // 200M
    uint256 public constant AIRDROPS_CAP = 100_000_000 * 10**18;         // 100M

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event StakingRewardsMinted(address indexed to, uint256 amount);
    event GameplayRewardsMinted(address indexed to, uint256 amount);
    event AirdropMinted(address indexed to, uint256 amount);

    constructor() ERC20("GrepCoin", "GREP") ERC20Permit("GrepCoin") Ownable(msg.sender) {
        // Mint initial 40% to deployer
        _mint(msg.sender, 400_000_000 * 10**18);
    }

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /**
     * @dev Add a minter (staking pool or rewards distributor)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint staking rewards (capped at 300M)
     */
    function mintStakingRewards(address to, uint256 amount) external onlyMinter {
        require(stakingRewardsMinted + amount <= STAKING_REWARDS_CAP, "Staking rewards cap exceeded");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");

        stakingRewardsMinted += amount;
        _mint(to, amount);
        emit StakingRewardsMinted(to, amount);
    }

    /**
     * @dev Mint gameplay rewards (capped at 200M)
     */
    function mintGameplayRewards(address to, uint256 amount) external onlyMinter {
        require(gameplayRewardsMinted + amount <= GAMEPLAY_REWARDS_CAP, "Gameplay rewards cap exceeded");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");

        gameplayRewardsMinted += amount;
        _mint(to, amount);
        emit GameplayRewardsMinted(to, amount);
    }

    /**
     * @dev Mint airdrop tokens (capped at 100M)
     */
    function mintAirdrop(address to, uint256 amount) external onlyMinter {
        require(airdropsMinted + amount <= AIRDROPS_CAP, "Airdrops cap exceeded");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");

        airdropsMinted += amount;
        _mint(to, amount);
        emit AirdropMinted(to, amount);
    }

    /**
     * @dev Get remaining mintable amounts
     */
    function getRemainingMintable() external view returns (
        uint256 stakingRemaining,
        uint256 gameplayRemaining,
        uint256 airdropsRemaining
    ) {
        stakingRemaining = STAKING_REWARDS_CAP - stakingRewardsMinted;
        gameplayRemaining = GAMEPLAY_REWARDS_CAP - gameplayRewardsMinted;
        airdropsRemaining = AIRDROPS_CAP - airdropsMinted;
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
     * @dev Override _update to add pause functionality
     */
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
}
