// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GrepBurner is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public grepToken;

    uint256 public totalBurned;
    uint256 public burnCount;

    // Burn tiers for benefits
    uint256 public constant BRONZE_THRESHOLD = 1000 * 10**18;    // 1,000 GREP
    uint256 public constant SILVER_THRESHOLD = 10000 * 10**18;   // 10,000 GREP
    uint256 public constant GOLD_THRESHOLD = 100000 * 10**18;    // 100,000 GREP
    uint256 public constant DIAMOND_THRESHOLD = 1000000 * 10**18; // 1,000,000 GREP

    struct BurnRecord {
        address burner;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }

    mapping(address => uint256) public userTotalBurned;
    mapping(address => BurnRecord[]) public userBurnHistory;
    BurnRecord[] public allBurns;

    event TokensBurned(address indexed burner, uint256 amount, string reason);
    event TierReached(address indexed user, string tier);

    constructor(address _grepToken) Ownable(msg.sender) {
        grepToken = IERC20(_grepToken);
    }

    function burn(uint256 amount, string calldata reason) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        uint256 previousTotal = userTotalBurned[msg.sender];

        // Transfer tokens to this contract then burn by sending to dead address
        grepToken.safeTransferFrom(msg.sender, address(0xdead), amount);

        totalBurned += amount;
        burnCount++;
        userTotalBurned[msg.sender] += amount;

        BurnRecord memory record = BurnRecord({
            burner: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            reason: reason
        });

        userBurnHistory[msg.sender].push(record);
        allBurns.push(record);

        emit TokensBurned(msg.sender, amount, reason);

        // Check for tier upgrades
        _checkTierUpgrade(msg.sender, previousTotal, userTotalBurned[msg.sender]);
    }

    function _checkTierUpgrade(address user, uint256 previous, uint256 current) internal {
        if (previous < BRONZE_THRESHOLD && current >= BRONZE_THRESHOLD) {
            emit TierReached(user, "Bronze");
        }
        if (previous < SILVER_THRESHOLD && current >= SILVER_THRESHOLD) {
            emit TierReached(user, "Silver");
        }
        if (previous < GOLD_THRESHOLD && current >= GOLD_THRESHOLD) {
            emit TierReached(user, "Gold");
        }
        if (previous < DIAMOND_THRESHOLD && current >= DIAMOND_THRESHOLD) {
            emit TierReached(user, "Diamond");
        }
    }

    function getUserTier(address user) external view returns (string memory) {
        uint256 burned = userTotalBurned[user];
        if (burned >= DIAMOND_THRESHOLD) return "Diamond";
        if (burned >= GOLD_THRESHOLD) return "Gold";
        if (burned >= SILVER_THRESHOLD) return "Silver";
        if (burned >= BRONZE_THRESHOLD) return "Bronze";
        return "None";
    }

    function getUserBurnCount(address user) external view returns (uint256) {
        return userBurnHistory[user].length;
    }

    function getRecentBurns(uint256 count) external view returns (BurnRecord[] memory) {
        uint256 length = allBurns.length;
        if (count > length) count = length;

        BurnRecord[] memory recent = new BurnRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = allBurns[length - count + i];
        }
        return recent;
    }
}
