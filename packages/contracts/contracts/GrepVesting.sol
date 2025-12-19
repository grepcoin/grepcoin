// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GrepVesting
 * @dev Token vesting contract with cliff and linear release
 *
 * Features:
 * - Cliff period before any tokens can be claimed
 * - Linear vesting after cliff
 * - Revocable schedules (for employees/contractors)
 * - Multiple beneficiaries supported
 */
contract GrepVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable grepToken;

    struct VestingSchedule {
        uint256 totalAmount;      // Total tokens to vest
        uint256 startTime;        // Vesting start timestamp
        uint256 cliffDuration;    // Cliff period in seconds
        uint256 vestingDuration;  // Total vesting duration (including cliff)
        uint256 released;         // Amount already released
        bool revocable;           // Can be revoked by owner
        bool revoked;             // Has been revoked
    }

    // Beneficiary -> VestingSchedule
    mapping(address => VestingSchedule) public schedules;

    // Track total tokens locked in vesting
    uint256 public totalVested;
    uint256 public totalReleased;

    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);

    constructor(address _grepToken) Ownable(msg.sender) {
        require(_grepToken != address(0), "Invalid token address");
        grepToken = IERC20(_grepToken);
    }

    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address that will receive vested tokens
     * @param amount Total amount to vest
     * @param startTime When vesting starts (0 = now)
     * @param cliffDuration Cliff period in seconds
     * @param vestingDuration Total vesting duration including cliff
     * @param revocable Whether the schedule can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Amount must be > 0");
        require(vestingDuration > 0, "Duration must be > 0");
        require(cliffDuration <= vestingDuration, "Cliff > duration");
        require(schedules[beneficiary].totalAmount == 0, "Schedule exists");

        if (startTime == 0) {
            startTime = block.timestamp;
        }

        // Transfer tokens to this contract
        grepToken.safeTransferFrom(msg.sender, address(this), amount);

        schedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            startTime: startTime,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            released: 0,
            revocable: revocable,
            revoked: false
        });

        totalVested += amount;

        emit VestingScheduleCreated(
            beneficiary,
            amount,
            startTime,
            cliffDuration,
            vestingDuration,
            revocable
        );
    }

    /**
     * @dev Release vested tokens to beneficiary
     */
    function release() external nonReentrant {
        VestingSchedule storage schedule = schedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(!schedule.revoked, "Schedule revoked");

        uint256 releasable = _releasableAmount(msg.sender);
        require(releasable > 0, "No tokens to release");

        schedule.released += releasable;
        totalReleased += releasable;

        grepToken.safeTransfer(msg.sender, releasable);

        emit TokensReleased(msg.sender, releasable);
    }

    /**
     * @dev Revoke a vesting schedule (only for revocable schedules)
     * @param beneficiary Address whose schedule to revoke
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = schedules[beneficiary];
        require(schedule.totalAmount > 0, "No vesting schedule");
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");

        // Calculate what's been vested but not released
        uint256 vested = _vestedAmount(beneficiary);
        uint256 unreleased = vested - schedule.released;

        // Calculate unvested amount to return to owner
        uint256 unvested = schedule.totalAmount - vested;

        schedule.revoked = true;

        // Release any vested but unreleased tokens to beneficiary
        if (unreleased > 0) {
            schedule.released += unreleased;
            totalReleased += unreleased;
            grepToken.safeTransfer(beneficiary, unreleased);
            emit TokensReleased(beneficiary, unreleased);
        }

        // Return unvested tokens to owner
        if (unvested > 0) {
            totalVested -= unvested;
            grepToken.safeTransfer(owner(), unvested);
        }

        emit VestingRevoked(beneficiary, unvested);
    }

    /**
     * @dev Get the releasable amount for a beneficiary
     */
    function releasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }

    /**
     * @dev Get the vested amount for a beneficiary
     */
    function vestedAmount(address beneficiary) external view returns (uint256) {
        return _vestedAmount(beneficiary);
    }

    /**
     * @dev Get full schedule info for a beneficiary
     */
    function getScheduleInfo(address beneficiary) external view returns (
        uint256 total,
        uint256 vested,
        uint256 released,
        uint256 releasable,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool isRevocable,
        bool isRevoked
    ) {
        VestingSchedule storage schedule = schedules[beneficiary];
        total = schedule.totalAmount;
        vested = _vestedAmount(beneficiary);
        released = schedule.released;
        releasable = _releasableAmount(beneficiary);
        cliffEnd = schedule.startTime + schedule.cliffDuration;
        vestingEnd = schedule.startTime + schedule.vestingDuration;
        isRevocable = schedule.revocable;
        isRevoked = schedule.revoked;
    }

    function _releasableAmount(address beneficiary) internal view returns (uint256) {
        VestingSchedule storage schedule = schedules[beneficiary];
        if (schedule.revoked) return 0;
        return _vestedAmount(beneficiary) - schedule.released;
    }

    function _vestedAmount(address beneficiary) internal view returns (uint256) {
        VestingSchedule storage schedule = schedules[beneficiary];

        if (schedule.totalAmount == 0) return 0;
        if (schedule.revoked) return schedule.released;

        uint256 currentTime = block.timestamp;
        uint256 cliffEnd = schedule.startTime + schedule.cliffDuration;

        // Before cliff ends, nothing is vested
        if (currentTime < cliffEnd) {
            return 0;
        }

        uint256 vestingEnd = schedule.startTime + schedule.vestingDuration;

        // After vesting ends, everything is vested
        if (currentTime >= vestingEnd) {
            return schedule.totalAmount;
        }

        // Linear vesting between cliff and end
        uint256 timeFromStart = currentTime - schedule.startTime;
        return (schedule.totalAmount * timeFromStart) / schedule.vestingDuration;
    }
}
