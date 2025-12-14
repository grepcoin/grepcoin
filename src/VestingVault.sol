// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VestingVault
/// @notice Manages token vesting schedules for team, advisors, and early supporters
/// @dev Supports cliff periods, linear vesting, TGE unlocks, and revocation
contract VestingVault is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    /// @notice Vesting schedule configuration
    struct VestingSchedule {
        address beneficiary;      // Address that receives tokens
        uint256 totalAmount;      // Total tokens in schedule
        uint256 released;         // Tokens already released
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period in seconds
        uint256 vestingDuration;  // Total vesting period in seconds (after cliff)
        uint256 tgeAmount;        // Amount released at TGE (Token Generation Event)
        bool revocable;           // Whether schedule can be revoked
        bool revoked;             // Whether schedule has been revoked
    }

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice The token being vested
    IERC20 public immutable token;

    /// @notice Counter for schedule IDs
    uint256 public scheduleCount;

    /// @notice Mapping of schedule ID to vesting schedule
    mapping(uint256 => VestingSchedule) public schedules;

    /// @notice Mapping of beneficiary to their schedule IDs
    mapping(address => uint256[]) public beneficiarySchedules;

    /// @notice Total tokens locked in all active schedules
    uint256 public totalLocked;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        uint256 tgeAmount,
        bool revocable
    );

    event TokensReleased(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount);

    event ScheduleRevoked(uint256 indexed scheduleId, uint256 unvestedAmount);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ZeroAddress();
    error ZeroAmount();
    error InvalidDuration();
    error InvalidSchedule();
    error NothingToRelease();
    error NotRevocable();
    error AlreadyRevoked();
    error InsufficientBalance();
    error TgeExceedsTotal();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Creates the vesting vault
    /// @param _token Address of the token to vest
    /// @param _owner Address of the contract owner
    constructor(address _token, address _owner) Ownable(_owner) {
        if (_token == address(0) || _owner == address(0)) {
            revert ZeroAddress();
        }
        token = IERC20(_token);
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Creates a new vesting schedule
    /// @param beneficiary Address to receive vested tokens
    /// @param totalAmount Total tokens to vest
    /// @param cliffDuration Cliff period in seconds
    /// @param vestingDuration Vesting duration in seconds (after cliff)
    /// @param tgePercent Percentage (0-100) unlocked at TGE
    /// @param revocable Whether the schedule can be revoked
    /// @return scheduleId The ID of the created schedule
    function createSchedule(
        address beneficiary,
        uint256 totalAmount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        uint256 tgePercent,
        bool revocable
    ) external onlyOwner returns (uint256 scheduleId) {
        if (beneficiary == address(0)) revert ZeroAddress();
        if (totalAmount == 0) revert ZeroAmount();
        if (vestingDuration == 0) revert InvalidDuration();
        if (tgePercent > 100) revert TgeExceedsTotal();

        // Calculate TGE amount
        uint256 tgeAmount = (totalAmount * tgePercent) / 100;

        // Check we have enough tokens
        uint256 available = token.balanceOf(address(this)) - totalLocked;
        if (available < totalAmount) revert InsufficientBalance();

        scheduleId = scheduleCount++;

        schedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            released: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            tgeAmount: tgeAmount,
            revocable: revocable,
            revoked: false
        });

        beneficiarySchedules[beneficiary].push(scheduleId);
        totalLocked += totalAmount;

        emit ScheduleCreated(
            scheduleId, beneficiary, totalAmount, cliffDuration, vestingDuration, tgeAmount, revocable
        );

        // Release TGE amount immediately if any
        if (tgeAmount > 0) {
            _release(scheduleId, tgeAmount);
        }
    }

    /// @notice Creates multiple vesting schedules in a batch
    /// @param beneficiaries Array of beneficiary addresses
    /// @param amounts Array of total amounts
    /// @param cliffDurations Array of cliff durations
    /// @param vestingDurations Array of vesting durations
    /// @param tgePercents Array of TGE percentages
    /// @param revocable Whether schedules are revocable
    function createScheduleBatch(
        address[] calldata beneficiaries,
        uint256[] calldata amounts,
        uint256[] calldata cliffDurations,
        uint256[] calldata vestingDurations,
        uint256[] calldata tgePercents,
        bool revocable
    ) external onlyOwner {
        uint256 length = beneficiaries.length;
        require(
            amounts.length == length && cliffDurations.length == length && vestingDurations.length == length
                && tgePercents.length == length,
            "Array length mismatch"
        );

        for (uint256 i = 0; i < length;) {
            // Inline schedule creation for gas efficiency
            if (beneficiaries[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            if (vestingDurations[i] == 0) revert InvalidDuration();
            if (tgePercents[i] > 100) revert TgeExceedsTotal();

            uint256 tgeAmount = (amounts[i] * tgePercents[i]) / 100;
            uint256 available = token.balanceOf(address(this)) - totalLocked;
            if (available < amounts[i]) revert InsufficientBalance();

            uint256 scheduleId = scheduleCount++;

            schedules[scheduleId] = VestingSchedule({
                beneficiary: beneficiaries[i],
                totalAmount: amounts[i],
                released: 0,
                startTime: block.timestamp,
                cliffDuration: cliffDurations[i],
                vestingDuration: vestingDurations[i],
                tgeAmount: tgeAmount,
                revocable: revocable,
                revoked: false
            });

            beneficiarySchedules[beneficiaries[i]].push(scheduleId);
            totalLocked += amounts[i];

            emit ScheduleCreated(
                scheduleId, beneficiaries[i], amounts[i], cliffDurations[i], vestingDurations[i], tgeAmount, revocable
            );

            if (tgeAmount > 0) {
                _release(scheduleId, tgeAmount);
            }

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Releases vested tokens for a schedule
    /// @param scheduleId ID of the schedule to release from
    function release(uint256 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert InvalidSchedule();
        if (schedule.revoked) revert AlreadyRevoked();

        uint256 releasable = _releasableAmount(scheduleId);
        if (releasable == 0) revert NothingToRelease();

        _release(scheduleId, releasable);
    }

    /// @notice Releases vested tokens for all of caller's schedules
    function releaseAll() external nonReentrant {
        uint256[] storage userSchedules = beneficiarySchedules[msg.sender];
        uint256 length = userSchedules.length;

        for (uint256 i = 0; i < length;) {
            uint256 scheduleId = userSchedules[i];
            VestingSchedule storage schedule = schedules[scheduleId];

            if (!schedule.revoked) {
                uint256 releasable = _releasableAmount(scheduleId);
                if (releasable > 0) {
                    _release(scheduleId, releasable);
                }
            }

            unchecked {
                ++i;
            }
        }
    }

    /// @notice Revokes a vesting schedule, returning unvested tokens to owner
    /// @param scheduleId ID of the schedule to revoke
    function revoke(uint256 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = schedules[scheduleId];
        if (schedule.beneficiary == address(0)) revert InvalidSchedule();
        if (!schedule.revocable) revert NotRevocable();
        if (schedule.revoked) revert AlreadyRevoked();

        // First release any currently vested amount
        uint256 releasable = _releasableAmount(scheduleId);
        if (releasable > 0) {
            _release(scheduleId, releasable);
        }

        // Calculate unvested amount
        uint256 unvested = schedule.totalAmount - schedule.released;

        schedule.revoked = true;
        totalLocked -= unvested;

        // Return unvested to owner
        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }

        emit ScheduleRevoked(scheduleId, unvested);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns the amount that can be released from a schedule
    /// @param scheduleId ID of the schedule
    /// @return The releasable amount
    function releasable(uint256 scheduleId) external view returns (uint256) {
        return _releasableAmount(scheduleId);
    }

    /// @notice Returns the total vested amount for a schedule
    /// @param scheduleId ID of the schedule
    /// @return The vested amount (released + releasable)
    function vestedAmount(uint256 scheduleId) external view returns (uint256) {
        return _vestedAmount(scheduleId);
    }

    /// @notice Returns all schedule IDs for a beneficiary
    /// @param beneficiary Address to query
    /// @return Array of schedule IDs
    function getScheduleIds(address beneficiary) external view returns (uint256[] memory) {
        return beneficiarySchedules[beneficiary];
    }

    /// @notice Returns full schedule details
    /// @param scheduleId ID of the schedule
    /// @return Full vesting schedule struct
    function getSchedule(uint256 scheduleId) external view returns (VestingSchedule memory) {
        return schedules[scheduleId];
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Calculates the vested amount for a schedule
    function _vestedAmount(uint256 scheduleId) internal view returns (uint256) {
        VestingSchedule storage schedule = schedules[scheduleId];

        if (schedule.revoked) {
            return schedule.released;
        }

        uint256 elapsed = block.timestamp - schedule.startTime;

        // TGE amount is immediately vested
        uint256 vested = schedule.tgeAmount;

        // Nothing beyond TGE until cliff passes
        if (elapsed < schedule.cliffDuration) {
            return vested;
        }

        // Calculate linear vesting after cliff
        uint256 vestingElapsed = elapsed - schedule.cliffDuration;
        uint256 vestingAmount = schedule.totalAmount - schedule.tgeAmount;

        if (vestingElapsed >= schedule.vestingDuration) {
            // Fully vested
            vested = schedule.totalAmount;
        } else {
            // Partial vesting
            vested += (vestingAmount * vestingElapsed) / schedule.vestingDuration;
        }

        return vested;
    }

    /// @dev Calculates the releasable amount for a schedule
    function _releasableAmount(uint256 scheduleId) internal view returns (uint256) {
        return _vestedAmount(scheduleId) - schedules[scheduleId].released;
    }

    /// @dev Releases tokens from a schedule
    function _release(uint256 scheduleId, uint256 amount) internal {
        VestingSchedule storage schedule = schedules[scheduleId];

        schedule.released += amount;
        totalLocked -= amount;

        token.safeTransfer(schedule.beneficiary, amount);

        emit TokensReleased(scheduleId, schedule.beneficiary, amount);
    }
}
