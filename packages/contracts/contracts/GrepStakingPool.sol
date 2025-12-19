// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IGrepToken {
    function mintStakingRewards(address to, uint256 amount) external;
}

/**
 * @title GrepStakingPool
 * @dev Staking contract for GREP tokens with tier-based multipliers
 *
 * Tiers:
 * - Flexible: 100 GREP min, no lock, 1.1x multiplier, 5% APY
 * - Bronze: 1,000 GREP min, 7 days lock, 1.25x multiplier, 8% APY
 * - Silver: 5,000 GREP min, 14 days lock, 1.5x multiplier, 12% APY
 * - Gold: 10,000 GREP min, 30 days lock, 1.75x multiplier, 15% APY
 * - Diamond: 50,000 GREP min, 90 days lock, 2.0x multiplier, 20% APY
 */
contract GrepStakingPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable grepToken;
    IGrepToken public immutable grepMinter;

    // Tier definitions
    enum Tier { None, Flexible, Bronze, Silver, Gold, Diamond }

    struct TierInfo {
        uint256 minStake;      // Minimum stake amount (in wei)
        uint256 lockDuration;  // Lock duration in seconds
        uint256 multiplier;    // Multiplier in basis points (10000 = 1x, 11000 = 1.1x)
        uint256 apyBps;        // APY in basis points (500 = 5%)
        uint256 bonusPlays;    // Bonus daily plays
    }

    struct StakeInfo {
        uint256 amount;
        Tier tier;
        uint256 stakedAt;
        uint256 lockedUntil;
        uint256 lastClaimAt;
        uint256 totalClaimed;
    }

    // Tier configurations
    mapping(Tier => TierInfo) public tierInfo;

    // User stakes
    mapping(address => StakeInfo) public stakes;

    // Platform stats
    uint256 public totalStaked;
    uint256 public totalStakers;
    uint256 public totalRewardsDistributed;

    // Events
    event Staked(address indexed user, uint256 amount, Tier tier, uint256 lockedUntil);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier);

    constructor(address _grepToken) Ownable(msg.sender) {
        require(_grepToken != address(0), "Invalid token address");
        grepToken = IERC20(_grepToken);
        grepMinter = IGrepToken(_grepToken);

        // Initialize tier info
        tierInfo[Tier.Flexible] = TierInfo({
            minStake: 100 * 10**18,
            lockDuration: 0,
            multiplier: 11000,  // 1.1x
            apyBps: 500,        // 5%
            bonusPlays: 2
        });

        tierInfo[Tier.Bronze] = TierInfo({
            minStake: 1_000 * 10**18,
            lockDuration: 7 days,
            multiplier: 12500,  // 1.25x
            apyBps: 800,        // 8%
            bonusPlays: 5
        });

        tierInfo[Tier.Silver] = TierInfo({
            minStake: 5_000 * 10**18,
            lockDuration: 14 days,
            multiplier: 15000,  // 1.5x
            apyBps: 1200,       // 12%
            bonusPlays: 10
        });

        tierInfo[Tier.Gold] = TierInfo({
            minStake: 10_000 * 10**18,
            lockDuration: 30 days,
            multiplier: 17500,  // 1.75x
            apyBps: 1500,       // 15%
            bonusPlays: 15
        });

        tierInfo[Tier.Diamond] = TierInfo({
            minStake: 50_000 * 10**18,
            lockDuration: 90 days,
            multiplier: 20000,  // 2.0x
            apyBps: 2000,       // 20%
            bonusPlays: 25
        });
    }

    /**
     * @dev Stake GREP tokens at a specific tier
     * @param amount Amount to stake
     * @param tier Desired tier (must meet minimum requirement)
     */
    function stake(uint256 amount, Tier tier) external nonReentrant whenNotPaused {
        require(tier != Tier.None, "Invalid tier");
        require(amount >= tierInfo[tier].minStake, "Below minimum stake for tier");

        StakeInfo storage userStake = stakes[msg.sender];

        // If user has existing stake, claim rewards first
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        } else {
            totalStakers++;
        }

        // Transfer tokens
        grepToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update stake
        uint256 newAmount = userStake.amount + amount;
        uint256 lockedUntil = block.timestamp + tierInfo[tier].lockDuration;

        // Check if upgrading tier
        Tier oldTier = userStake.tier;
        Tier newTier = _calculateTier(newAmount);

        // Use the higher tier between requested and calculated
        if (uint256(newTier) > uint256(tier)) {
            tier = newTier;
        }

        userStake.amount = newAmount;
        userStake.tier = tier;
        userStake.stakedAt = block.timestamp;
        userStake.lockedUntil = lockedUntil;
        if (userStake.lastClaimAt == 0) {
            userStake.lastClaimAt = block.timestamp;
        }

        totalStaked += amount;

        emit Staked(msg.sender, amount, tier, lockedUntil);

        if (oldTier != tier && oldTier != Tier.None) {
            emit TierUpgraded(msg.sender, oldTier, tier);
        }
    }

    /**
     * @dev Unstake all tokens (must be past lock period)
     */
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.lockedUntil, "Stake is still locked");

        // Claim any pending rewards first
        _claimRewards(msg.sender);

        uint256 amount = userStake.amount;

        // Reset stake
        userStake.amount = 0;
        userStake.tier = Tier.None;
        userStake.lockedUntil = 0;

        totalStaked -= amount;
        totalStakers--;

        // Transfer tokens back
        grepToken.safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal claim rewards logic
     */
    function _claimRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return;

        uint256 rewards = pendingRewards(user);
        if (rewards == 0) return;

        userStake.lastClaimAt = block.timestamp;
        userStake.totalClaimed += rewards;
        totalRewardsDistributed += rewards;

        // Mint rewards from token contract
        grepMinter.mintStakingRewards(user, rewards);

        emit RewardsClaimed(user, rewards);
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function pendingRewards(address user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0 || userStake.lastClaimAt == 0) return 0;

        uint256 duration = block.timestamp - userStake.lastClaimAt;
        uint256 apyBps = tierInfo[userStake.tier].apyBps;

        // Calculate rewards: amount * APY * duration / (365 days * 10000)
        return (userStake.amount * apyBps * duration) / (365 days * 10000);
    }

    /**
     * @dev Calculate tier based on staked amount
     */
    function _calculateTier(uint256 amount) internal view returns (Tier) {
        if (amount >= tierInfo[Tier.Diamond].minStake) return Tier.Diamond;
        if (amount >= tierInfo[Tier.Gold].minStake) return Tier.Gold;
        if (amount >= tierInfo[Tier.Silver].minStake) return Tier.Silver;
        if (amount >= tierInfo[Tier.Bronze].minStake) return Tier.Bronze;
        if (amount >= tierInfo[Tier.Flexible].minStake) return Tier.Flexible;
        return Tier.None;
    }

    /**
     * @dev Get user's current multiplier (for game rewards)
     */
    function getUserMultiplier(address user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 10000; // 1x base multiplier
        return tierInfo[userStake.tier].multiplier;
    }

    /**
     * @dev Get user's bonus daily plays
     */
    function getUserBonusPlays(address user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        return tierInfo[userStake.tier].bonusPlays;
    }

    // Struct for returning full stake info (avoids stack too deep)
    struct FullStakeInfo {
        uint256 amount;
        Tier tier;
        uint256 stakedAt;
        uint256 lockedUntil;
        uint256 lastClaimAt;
        uint256 totalClaimed;
        uint256 pendingReward;
        uint256 multiplier;
        uint256 bonusPlays;
    }

    /**
     * @dev Get user's full stake info
     */
    function getStakeInfo(address user) external view returns (FullStakeInfo memory info) {
        StakeInfo storage userStake = stakes[user];
        TierInfo storage tInfo = tierInfo[userStake.tier];

        info.amount = userStake.amount;
        info.tier = userStake.tier;
        info.stakedAt = userStake.stakedAt;
        info.lockedUntil = userStake.lockedUntil;
        info.lastClaimAt = userStake.lastClaimAt;
        info.totalClaimed = userStake.totalClaimed;
        info.pendingReward = pendingRewards(user);
        info.multiplier = userStake.amount > 0 ? tInfo.multiplier : 10000;
        info.bonusPlays = userStake.amount > 0 ? tInfo.bonusPlays : 0;
    }

    /**
     * @dev Get tier info
     */
    function getTierInfo(Tier tier) external view returns (TierInfo memory) {
        return tierInfo[tier];
    }

    /**
     * @dev Get all tier requirements (for UI)
     */
    function getAllTiers() external view returns (
        TierInfo memory flexible,
        TierInfo memory bronze,
        TierInfo memory silver,
        TierInfo memory gold,
        TierInfo memory diamond
    ) {
        return (
            tierInfo[Tier.Flexible],
            tierInfo[Tier.Bronze],
            tierInfo[Tier.Silver],
            tierInfo[Tier.Gold],
            tierInfo[Tier.Diamond]
        );
    }

    /**
     * @dev Emergency withdraw (owner only, for stuck tokens)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(grepToken), "Cannot withdraw staked tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Pause staking operations (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause staking operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
