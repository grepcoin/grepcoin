// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GrepStakingPool
 * @dev Real Yield Staking - Rewards from platform revenue, NOT from minting
 *
 * AI Evolution Economy Model:
 * - Rewards funded by platform revenue (marketplace fees, tournament fees, etc.)
 * - No new tokens minted - sustainable yield
 * - Lower but real APY (3-8% depending on revenue)
 *
 * Tiers:
 * - Basic:   100 GREP min, no lock, ~3% APY, vote on evolutions
 * - Silver:  1,000 GREP min, 7 days lock, ~5% APY, early access
 * - Gold:    5,000 GREP min, 30 days lock, ~6% APY, propose evolutions
 * - Diamond: 25,000 GREP min, 90 days lock, ~8% APY, revenue share + governance
 */
contract GrepStakingPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable grepToken;

    // Tier definitions
    enum Tier { None, Basic, Silver, Gold, Diamond }

    struct TierInfo {
        uint256 minStake;      // Minimum stake amount (in wei)
        uint256 lockDuration;  // Lock duration in seconds
        uint256 rewardWeight;  // Weight for reward distribution (100 = 1x, 150 = 1.5x)
        uint256 bonusPlays;    // Bonus daily plays
    }

    struct StakeInfo {
        uint256 amount;
        Tier tier;
        uint256 stakedAt;
        uint256 lockedUntil;
        uint256 rewardDebt;    // For reward calculation
        uint256 totalClaimed;
    }

    // Tier configurations
    mapping(Tier => TierInfo) public tierInfo;

    // User stakes
    mapping(address => StakeInfo) public stakes;

    // Reward pool (funded by platform revenue)
    uint256 public rewardPool;
    uint256 public accRewardPerShare; // Accumulated rewards per share (scaled by 1e12)
    uint256 public lastRewardTime;

    // Platform stats
    uint256 public totalStaked;
    uint256 public totalWeightedStake; // Sum of (stake * weight)
    uint256 public totalStakers;
    uint256 public totalRewardsDistributed;

    // Events
    event Staked(address indexed user, uint256 amount, Tier tier, uint256 lockedUntil);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsAdded(uint256 amount, address indexed from);
    event TierUpgraded(address indexed user, Tier oldTier, Tier newTier);

    constructor(address _grepToken) Ownable(msg.sender) {
        require(_grepToken != address(0), "Invalid token address");
        grepToken = IERC20(_grepToken);
        lastRewardTime = block.timestamp;

        // Initialize tier info - Real Yield Model
        tierInfo[Tier.Basic] = TierInfo({
            minStake: 100 * 10**18,
            lockDuration: 0,
            rewardWeight: 100,  // 1x
            bonusPlays: 2
        });

        tierInfo[Tier.Silver] = TierInfo({
            minStake: 1_000 * 10**18,
            lockDuration: 7 days,
            rewardWeight: 125,  // 1.25x
            bonusPlays: 5
        });

        tierInfo[Tier.Gold] = TierInfo({
            minStake: 5_000 * 10**18,
            lockDuration: 30 days,
            rewardWeight: 150,  // 1.5x
            bonusPlays: 10
        });

        tierInfo[Tier.Diamond] = TierInfo({
            minStake: 25_000 * 10**18,
            lockDuration: 90 days,
            rewardWeight: 200,  // 2x
            bonusPlays: 20
        });
    }

    /**
     * @dev Add rewards to the pool (called by platform revenue contracts)
     */
    function addRewards(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        grepToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        _updatePool();
        emit RewardsAdded(amount, msg.sender);
    }

    /**
     * @dev Update reward pool calculations
     */
    function _updatePool() internal {
        if (totalWeightedStake == 0) {
            lastRewardTime = block.timestamp;
            return;
        }

        // Distribute reward pool across stakers based on weight
        if (rewardPool > 0) {
            accRewardPerShare += (rewardPool * 1e12) / totalWeightedStake;
            rewardPool = 0;
        }
        lastRewardTime = block.timestamp;
    }

    /**
     * @dev Calculate user's weighted stake
     */
    function _getWeightedStake(address user) internal view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        return (userStake.amount * tierInfo[userStake.tier].rewardWeight) / 100;
    }

    /**
     * @dev Stake GREP tokens at a specific tier
     */
    function stake(uint256 amount, Tier tier) external nonReentrant whenNotPaused {
        require(tier != Tier.None, "Invalid tier");
        require(amount >= tierInfo[tier].minStake, "Below minimum stake for tier");

        _updatePool();

        StakeInfo storage userStake = stakes[msg.sender];

        // If user has existing stake, claim rewards first
        if (userStake.amount > 0) {
            uint256 pending = _pendingRewards(msg.sender);
            if (pending > 0) {
                userStake.totalClaimed += pending;
                totalRewardsDistributed += pending;
                grepToken.safeTransfer(msg.sender, pending);
                emit RewardsClaimed(msg.sender, pending);
            }
            // Remove old weighted stake
            totalWeightedStake -= _getWeightedStake(msg.sender);
        } else {
            totalStakers++;
        }

        // Transfer tokens
        grepToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update stake
        uint256 newAmount = userStake.amount + amount;
        uint256 lockedUntil = block.timestamp + tierInfo[tier].lockDuration;

        Tier oldTier = userStake.tier;
        Tier newTier = _calculateTier(newAmount);

        // Use the higher tier
        if (uint256(newTier) > uint256(tier)) {
            tier = newTier;
            lockedUntil = block.timestamp + tierInfo[tier].lockDuration;
        }

        userStake.amount = newAmount;
        userStake.tier = tier;
        userStake.stakedAt = block.timestamp;
        userStake.lockedUntil = lockedUntil;

        // Add new weighted stake
        uint256 weightedStake = (newAmount * tierInfo[tier].rewardWeight) / 100;
        totalWeightedStake += weightedStake;
        userStake.rewardDebt = (weightedStake * accRewardPerShare) / 1e12;

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

        _updatePool();

        // Claim pending rewards
        uint256 pending = _pendingRewards(msg.sender);
        if (pending > 0) {
            userStake.totalClaimed += pending;
            totalRewardsDistributed += pending;
            grepToken.safeTransfer(msg.sender, pending);
            emit RewardsClaimed(msg.sender, pending);
        }

        uint256 amount = userStake.amount;

        // Remove weighted stake
        totalWeightedStake -= _getWeightedStake(msg.sender);

        // Reset stake
        userStake.amount = 0;
        userStake.tier = Tier.None;
        userStake.lockedUntil = 0;
        userStake.rewardDebt = 0;

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
        _updatePool();

        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");

        uint256 pending = _pendingRewards(msg.sender);
        require(pending > 0, "No rewards to claim");

        userStake.totalClaimed += pending;
        totalRewardsDistributed += pending;

        // Update reward debt
        uint256 weightedStake = _getWeightedStake(msg.sender);
        userStake.rewardDebt = (weightedStake * accRewardPerShare) / 1e12;

        grepToken.safeTransfer(msg.sender, pending);

        emit RewardsClaimed(msg.sender, pending);
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function _pendingRewards(address user) internal view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 weightedStake = _getWeightedStake(user);
        uint256 accumulated = (weightedStake * accRewardPerShare) / 1e12;

        if (accumulated <= userStake.rewardDebt) return 0;
        return accumulated - userStake.rewardDebt;
    }

    /**
     * @dev Public view for pending rewards
     */
    function pendingRewards(address user) public view returns (uint256) {
        return _pendingRewards(user);
    }

    /**
     * @dev Calculate tier based on staked amount
     */
    function _calculateTier(uint256 amount) internal view returns (Tier) {
        if (amount >= tierInfo[Tier.Diamond].minStake) return Tier.Diamond;
        if (amount >= tierInfo[Tier.Gold].minStake) return Tier.Gold;
        if (amount >= tierInfo[Tier.Silver].minStake) return Tier.Silver;
        if (amount >= tierInfo[Tier.Basic].minStake) return Tier.Basic;
        return Tier.None;
    }

    /**
     * @dev Get user's bonus daily plays
     */
    function getUserBonusPlays(address user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        return tierInfo[userStake.tier].bonusPlays;
    }

    /**
     * @dev Get user's reward weight multiplier
     */
    function getUserWeight(address user) external view returns (uint256) {
        StakeInfo storage userStake = stakes[user];
        if (userStake.amount == 0) return 100;
        return tierInfo[userStake.tier].rewardWeight;
    }

    // Struct for returning full stake info
    struct FullStakeInfo {
        uint256 amount;
        Tier tier;
        uint256 stakedAt;
        uint256 lockedUntil;
        uint256 totalClaimed;
        uint256 pendingReward;
        uint256 rewardWeight;
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
        info.totalClaimed = userStake.totalClaimed;
        info.pendingReward = pendingRewards(user);
        info.rewardWeight = userStake.amount > 0 ? tInfo.rewardWeight : 100;
        info.bonusPlays = userStake.amount > 0 ? tInfo.bonusPlays : 0;
    }

    /**
     * @dev Get pool stats
     */
    function getPoolStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalStakers,
        uint256 _rewardPool,
        uint256 _totalDistributed
    ) {
        return (totalStaked, totalStakers, rewardPool, totalRewardsDistributed);
    }

    /**
     * @dev Emergency withdraw (owner only, for stuck tokens other than GREP)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(grepToken), "Cannot withdraw staked tokens");
        IERC20(token).safeTransfer(owner(), amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
