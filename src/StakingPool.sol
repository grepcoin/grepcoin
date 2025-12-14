// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title StakingPool
/// @notice Multi-tier staking pool with time-locked rewards
/// @dev Supports 5 tiers with different lock periods and APY rates
contract StakingPool is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Staking tier configuration
    enum Tier {
        Flexible,  // 0: No lock, 5% APY
        Bronze,    // 1: 30 days, 8% APY
        Silver,    // 2: 90 days, 12% APY
        Gold,      // 3: 180 days, 15% APY
        Diamond    // 4: 365 days, 20% APY
    }

    /// @notice Individual stake record
    struct Stake {
        uint256 amount;           // Staked amount
        uint256 rewardDebt;       // Reward debt for calculation
        uint256 pendingRewards;   // Accumulated pending rewards
        uint256 startTime;        // When stake was created
        uint256 lockEndTime;      // When lock period ends
        Tier tier;                // Staking tier
        bool active;              // Whether stake is active
    }

    /// @notice Tier configuration
    struct TierConfig {
        uint256 lockDuration;     // Lock period in seconds
        uint256 apyBps;           // APY in basis points (100 = 1%)
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Seconds per year for APY calculation
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    /// @notice Emergency withdrawal penalty (50%)
    uint256 public constant EMERGENCY_PENALTY_BPS = 5000;

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice The staking token
    IERC20 public immutable stakingToken;

    /// @notice Counter for stake IDs
    uint256 public stakeCount;

    /// @notice Mapping of stake ID to stake data
    mapping(uint256 => Stake) public stakes;

    /// @notice Mapping of user to their stake IDs
    mapping(address => uint256[]) public userStakes;

    /// @notice Mapping of user to total staked amount
    mapping(address => uint256) public userTotalStaked;

    /// @notice Tier configurations
    mapping(Tier => TierConfig) public tierConfigs;

    /// @notice Total tokens staked across all users
    uint256 public totalStaked;

    /// @notice Total rewards available for distribution
    uint256 public rewardPool;

    /// @notice Treasury address for penalties
    address public treasury;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event Staked(uint256 indexed stakeId, address indexed user, uint256 amount, Tier tier, uint256 lockEndTime);

    event Unstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 rewards);

    event RewardsClaimed(uint256 indexed stakeId, address indexed user, uint256 amount);

    event EmergencyWithdraw(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 penalty);

    event RewardsAdded(uint256 amount);

    event TreasuryUpdated(address indexed newTreasury);

    event TierConfigUpdated(Tier indexed tier, uint256 lockDuration, uint256 apyBps);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ZeroAddress();
    error ZeroAmount();
    error InvalidTier();
    error StakeNotFound();
    error StakeNotActive();
    error StakeLocked();
    error InsufficientRewardPool();
    error NotStakeOwner();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Creates the staking pool
    /// @param _stakingToken Token to stake
    /// @param _treasury Address for penalty fees
    /// @param _owner Contract owner
    constructor(address _stakingToken, address _treasury, address _owner) Ownable(_owner) {
        if (_stakingToken == address(0) || _treasury == address(0) || _owner == address(0)) {
            revert ZeroAddress();
        }

        stakingToken = IERC20(_stakingToken);
        treasury = _treasury;

        // Initialize tier configs
        tierConfigs[Tier.Flexible] = TierConfig({lockDuration: 0, apyBps: 500}); // 5%
        tierConfigs[Tier.Bronze] = TierConfig({lockDuration: 30 days, apyBps: 800}); // 8%
        tierConfigs[Tier.Silver] = TierConfig({lockDuration: 90 days, apyBps: 1200}); // 12%
        tierConfigs[Tier.Gold] = TierConfig({lockDuration: 180 days, apyBps: 1500}); // 15%
        tierConfigs[Tier.Diamond] = TierConfig({lockDuration: 365 days, apyBps: 2000}); // 20%
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Stakes tokens in a specified tier
    /// @param amount Amount to stake
    /// @param tier Staking tier
    /// @return stakeId The ID of the created stake
    function stake(uint256 amount, Tier tier) external nonReentrant whenNotPaused returns (uint256 stakeId) {
        if (amount == 0) revert ZeroAmount();
        if (uint8(tier) > uint8(Tier.Diamond)) revert InvalidTier();

        TierConfig storage config = tierConfigs[tier];

        stakeId = stakeCount++;
        uint256 lockEndTime = block.timestamp + config.lockDuration;

        stakes[stakeId] = Stake({
            amount: amount,
            rewardDebt: 0,
            pendingRewards: 0,
            startTime: block.timestamp,
            lockEndTime: lockEndTime,
            tier: tier,
            active: true
        });

        userStakes[msg.sender].push(stakeId);
        userTotalStaked[msg.sender] += amount;
        totalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(stakeId, msg.sender, amount, tier, lockEndTime);
    }

    /// @notice Unstakes tokens and claims rewards
    /// @param stakeId ID of the stake to withdraw
    function unstake(uint256 stakeId) external nonReentrant {
        Stake storage stakeData = stakes[stakeId];
        if (!stakeData.active) revert StakeNotActive();
        if (!_isStakeOwner(stakeId, msg.sender)) revert NotStakeOwner();
        if (block.timestamp < stakeData.lockEndTime) revert StakeLocked();

        uint256 amount = stakeData.amount;
        uint256 rewards = _calculateRewards(stakeId);

        // Check reward pool has enough
        if (rewards > rewardPool) {
            rewards = rewardPool;
        }

        stakeData.active = false;
        userTotalStaked[msg.sender] -= amount;
        totalStaked -= amount;
        rewardPool -= rewards;

        uint256 totalPayout = amount + rewards;
        stakingToken.safeTransfer(msg.sender, totalPayout);

        emit Unstaked(stakeId, msg.sender, amount, rewards);
    }

    /// @notice Claims rewards without unstaking
    /// @param stakeId ID of the stake
    function claimRewards(uint256 stakeId) external nonReentrant {
        Stake storage stakeData = stakes[stakeId];
        if (!stakeData.active) revert StakeNotActive();
        if (!_isStakeOwner(stakeId, msg.sender)) revert NotStakeOwner();

        uint256 rewards = _calculateRewards(stakeId);
        if (rewards == 0) revert ZeroAmount();

        // Check reward pool
        if (rewards > rewardPool) {
            rewards = rewardPool;
        }

        // Update stake tracking
        stakeData.pendingRewards = 0;
        stakeData.rewardDebt += rewards;
        stakeData.startTime = block.timestamp; // Reset for next period

        rewardPool -= rewards;

        stakingToken.safeTransfer(msg.sender, rewards);

        emit RewardsClaimed(stakeId, msg.sender, rewards);
    }

    /// @notice Emergency withdrawal with penalty (before lock ends)
    /// @param stakeId ID of the stake
    function emergencyWithdraw(uint256 stakeId) external nonReentrant {
        Stake storage stakeData = stakes[stakeId];
        if (!stakeData.active) revert StakeNotActive();
        if (!_isStakeOwner(stakeId, msg.sender)) revert NotStakeOwner();

        uint256 amount = stakeData.amount;

        // Calculate penalty (50% of staked amount if before lock ends)
        uint256 penalty = 0;
        if (block.timestamp < stakeData.lockEndTime) {
            penalty = (amount * EMERGENCY_PENALTY_BPS) / BPS_DENOMINATOR;
        }

        stakeData.active = false;
        userTotalStaked[msg.sender] -= amount;
        totalStaked -= amount;

        uint256 userAmount = amount - penalty;

        // Transfer penalty to treasury
        if (penalty > 0) {
            stakingToken.safeTransfer(treasury, penalty);
        }

        // Transfer remaining to user (no rewards on emergency)
        stakingToken.safeTransfer(msg.sender, userAmount);

        emit EmergencyWithdraw(stakeId, msg.sender, userAmount, penalty);
    }

    /// @notice Compounds rewards back into stake
    /// @param stakeId ID of the stake
    function compound(uint256 stakeId) external nonReentrant whenNotPaused {
        Stake storage stakeData = stakes[stakeId];
        if (!stakeData.active) revert StakeNotActive();
        if (!_isStakeOwner(stakeId, msg.sender)) revert NotStakeOwner();

        uint256 rewards = _calculateRewards(stakeId);
        if (rewards == 0) revert ZeroAmount();
        if (rewards > rewardPool) revert InsufficientRewardPool();

        // Add rewards to stake
        stakeData.amount += rewards;
        stakeData.pendingRewards = 0;
        stakeData.rewardDebt = 0;
        stakeData.startTime = block.timestamp;

        userTotalStaked[msg.sender] += rewards;
        totalStaked += rewards;
        rewardPool -= rewards;

        emit RewardsClaimed(stakeId, msg.sender, rewards);
        emit Staked(stakeId, msg.sender, rewards, stakeData.tier, stakeData.lockEndTime);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Adds tokens to the reward pool
    /// @param amount Amount to add
    function addRewards(uint256 amount) external onlyOwner {
        if (amount == 0) revert ZeroAmount();

        rewardPool += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit RewardsAdded(amount);
    }

    /// @notice Updates treasury address
    /// @param newTreasury New treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /// @notice Updates tier configuration
    /// @param tier Tier to update
    /// @param lockDuration New lock duration
    /// @param apyBps New APY in basis points
    function setTierConfig(Tier tier, uint256 lockDuration, uint256 apyBps) external onlyOwner {
        tierConfigs[tier] = TierConfig({lockDuration: lockDuration, apyBps: apyBps});
        emit TierConfigUpdated(tier, lockDuration, apyBps);
    }

    /// @notice Pauses staking (not withdrawals)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses staking
    function unpause() external onlyOwner {
        _unpause();
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns pending rewards for a stake
    /// @param stakeId ID of the stake
    /// @return Pending reward amount
    function pendingRewards(uint256 stakeId) external view returns (uint256) {
        return _calculateRewards(stakeId);
    }

    /// @notice Returns all stake IDs for a user
    /// @param user Address to query
    /// @return Array of stake IDs
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }

    /// @notice Returns stake details
    /// @param stakeId ID of the stake
    /// @return Stake struct
    function getStake(uint256 stakeId) external view returns (Stake memory) {
        return stakes[stakeId];
    }

    /// @notice Returns tier configuration
    /// @param tier Tier to query
    /// @return TierConfig struct
    function getTierConfig(Tier tier) external view returns (TierConfig memory) {
        return tierConfigs[tier];
    }

    /// @notice Checks if a stake's lock period has ended
    /// @param stakeId ID of the stake
    /// @return True if unlocked
    function isUnlocked(uint256 stakeId) external view returns (bool) {
        return block.timestamp >= stakes[stakeId].lockEndTime;
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Calculates pending rewards for a stake
    function _calculateRewards(uint256 stakeId) internal view returns (uint256) {
        Stake storage stakeData = stakes[stakeId];

        if (!stakeData.active || stakeData.amount == 0) {
            return 0;
        }

        TierConfig storage config = tierConfigs[stakeData.tier];
        uint256 timeElapsed = block.timestamp - stakeData.startTime;

        // Calculate rewards: amount * APY * time / year
        uint256 rewards = (stakeData.amount * config.apyBps * timeElapsed) / (BPS_DENOMINATOR * SECONDS_PER_YEAR);

        return rewards + stakeData.pendingRewards - stakeData.rewardDebt;
    }

    /// @dev Checks if caller owns the stake
    function _isStakeOwner(uint256 stakeId, address user) internal view returns (bool) {
        uint256[] storage userStakeIds = userStakes[user];
        uint256 length = userStakeIds.length;

        for (uint256 i = 0; i < length;) {
            if (userStakeIds[i] == stakeId) {
                return true;
            }
            unchecked {
                ++i;
            }
        }

        return false;
    }
}
