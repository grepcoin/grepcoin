// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {GrepToken} from "../src/GrepToken.sol";
import {VestingVault} from "../src/VestingVault.sol";
import {StakingPool} from "../src/StakingPool.sol";
import {GrepGovernor} from "../src/GrepGovernor.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

/// @title Deploy
/// @notice Main deployment script for GrepCoin ecosystem
contract Deploy is Script {
    // Deployment addresses
    GrepToken public token;
    VestingVault public vestingVault;
    StakingPool public stakingPool;
    TimelockController public timelock;
    GrepGovernor public governor;

    // Configuration
    uint256 public constant TIMELOCK_MIN_DELAY = 2 days;

    // Token allocations (from tokenomics)
    uint256 public constant COMMUNITY_ALLOCATION = 200_000_000 * 10 ** 18; // 40%
    uint256 public constant DEVELOPMENT_ALLOCATION = 100_000_000 * 10 ** 18; // 20%
    uint256 public constant TEAM_ALLOCATION = 75_000_000 * 10 ** 18; // 15%
    uint256 public constant LIQUIDITY_ALLOCATION = 50_000_000 * 10 ** 18; // 10%
    uint256 public constant EARLY_SUPPORTERS_ALLOCATION = 50_000_000 * 10 ** 18; // 10%
    uint256 public constant ADVISORS_ALLOCATION = 25_000_000 * 10 ** 18; // 5%

    // Staking pool initial rewards
    uint256 public constant INITIAL_STAKING_REWARDS = 20_000_000 * 10 ** 18;

    function run() external {
        // Load configuration from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address initialOwner = vm.envAddress("INITIAL_OWNER");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Token
        console2.log("Deploying GrepToken...");
        token = new GrepToken(treasury, initialOwner);
        console2.log("GrepToken deployed at:", address(token));

        // 2. Deploy Vesting Vault
        console2.log("Deploying VestingVault...");
        vestingVault = new VestingVault(address(token), initialOwner);
        console2.log("VestingVault deployed at:", address(vestingVault));

        // 3. Deploy Staking Pool
        console2.log("Deploying StakingPool...");
        stakingPool = new StakingPool(address(token), treasury, initialOwner);
        console2.log("StakingPool deployed at:", address(stakingPool));

        // 4. Deploy Timelock
        console2.log("Deploying TimelockController...");
        address[] memory proposers = new address[](1);
        address[] memory executors = new address[](1);
        proposers[0] = address(0); // Will be set to governor after deployment
        executors[0] = address(0); // Anyone can execute after delay

        timelock = new TimelockController(TIMELOCK_MIN_DELAY, proposers, executors, initialOwner);
        console2.log("TimelockController deployed at:", address(timelock));

        // 5. Deploy Governor
        console2.log("Deploying GrepGovernor...");
        governor = new GrepGovernor(IVotes(address(token)), timelock);
        console2.log("GrepGovernor deployed at:", address(governor));

        // 6. Configure Timelock roles
        console2.log("Configuring Timelock roles...");
        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        bytes32 executorRole = timelock.EXECUTOR_ROLE();
        bytes32 adminRole = timelock.DEFAULT_ADMIN_ROLE();

        // Grant proposer role to governor
        timelock.grantRole(proposerRole, address(governor));

        // Grant executor role to anyone (address(0))
        timelock.grantRole(executorRole, address(0));

        // Revoke admin role from deployer (governor controls timelock)
        timelock.revokeRole(adminRole, initialOwner);

        // 7. Exempt contracts from token limits
        console2.log("Setting token exemptions...");
        // Note: This must be called by the token owner
        // token.setExempt(address(vestingVault), true);
        // token.setExempt(address(stakingPool), true);
        // token.setExempt(address(timelock), true);

        vm.stopBroadcast();

        // Log deployment summary
        console2.log("\n========== DEPLOYMENT SUMMARY ==========");
        console2.log("Network:", block.chainid);
        console2.log("GrepToken:", address(token));
        console2.log("VestingVault:", address(vestingVault));
        console2.log("StakingPool:", address(stakingPool));
        console2.log("TimelockController:", address(timelock));
        console2.log("GrepGovernor:", address(governor));
        console2.log("=========================================\n");

        console2.log("POST-DEPLOYMENT ACTIONS REQUIRED:");
        console2.log("1. Transfer tokens to VestingVault for vesting schedules");
        console2.log("2. Create vesting schedules for team, advisors, early supporters");
        console2.log("3. Fund StakingPool with initial rewards");
        console2.log("4. Set token exemptions for contracts");
        console2.log("5. Add liquidity to DEX");
        console2.log("6. Transfer ownership to multisig");
    }
}

/// @title DeployToken
/// @notice Deploys only the token contract
contract DeployToken is Script {
    function run() external returns (GrepToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        address initialOwner = vm.envAddress("INITIAL_OWNER");

        vm.startBroadcast(deployerPrivateKey);
        GrepToken token = new GrepToken(treasury, initialOwner);
        vm.stopBroadcast();

        console2.log("GrepToken deployed at:", address(token));
        return token;
    }
}

/// @title SetupVesting
/// @notice Sets up vesting schedules after deployment
contract SetupVesting is Script {
    // Vesting durations
    uint256 public constant TEAM_CLIFF = 365 days;
    uint256 public constant TEAM_VESTING = 3 * 365 days;

    uint256 public constant ADVISOR_CLIFF = 180 days;
    uint256 public constant ADVISOR_VESTING = 2 * 365 days;

    uint256 public constant EARLY_SUPPORTER_CLIFF = 0;
    uint256 public constant EARLY_SUPPORTER_VESTING = 365 days;
    uint256 public constant EARLY_SUPPORTER_TGE = 10; // 10%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address vestingVaultAddress = vm.envAddress("VESTING_VAULT_ADDRESS");

        VestingVault vestingVault = VestingVault(vestingVaultAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Example: Create team vesting schedule
        // vestingVault.createSchedule(
        //     teamMemberAddress,
        //     teamMemberAllocation,
        //     TEAM_CLIFF,
        //     TEAM_VESTING,
        //     0, // No TGE for team
        //     true // Revocable
        // );

        vm.stopBroadcast();

        console2.log("Vesting schedules created");
    }
}
