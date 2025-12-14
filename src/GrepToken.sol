// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title GrepCoin Token
/// @notice ERC-20 token with voting, burning, and anti-whale protections
/// @dev Implements ERC20Votes for governance and configurable transfer limits
contract GrepToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, Ownable2Step {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Maximum total supply: 500 million tokens
    uint256 public constant MAX_SUPPLY = 500_000_000 * 10 ** 18;

    /// @notice Default max wallet: 2% of supply (10 million tokens)
    uint256 public constant DEFAULT_MAX_WALLET = 10_000_000 * 10 ** 18;

    /// @notice Default max transaction: 0.5% of supply (2.5 million tokens)
    uint256 public constant DEFAULT_MAX_TRANSACTION = 2_500_000 * 10 ** 18;

    /*//////////////////////////////////////////////////////////////
                                 STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Maximum tokens a single wallet can hold
    uint256 public maxWalletAmount;

    /// @notice Maximum tokens per transaction
    uint256 public maxTransactionAmount;

    /// @notice Whether transfer limits are active
    bool public limitsEnabled;

    /// @notice Addresses exempt from transfer limits
    mapping(address => bool) public isExempt;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event LimitsEnabledUpdated(bool enabled);
    event ExemptUpdated(address indexed account, bool exempt);
    event MaxWalletAmountUpdated(uint256 amount);
    event MaxTransactionAmountUpdated(uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ExceedsMaxTransaction(uint256 amount, uint256 max);
    error ExceedsMaxWallet(address account, uint256 newBalance, uint256 max);
    error InvalidAmount();
    error ZeroAddress();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Deploys the token and mints total supply to treasury
    /// @param treasury Address to receive the initial token supply
    /// @param initialOwner Address that will own the contract
    constructor(
        address treasury,
        address initialOwner
    ) ERC20("GrepCoin", "GREP") ERC20Permit("GrepCoin") Ownable(initialOwner) {
        if (treasury == address(0) || initialOwner == address(0)) {
            revert ZeroAddress();
        }

        // Set default limits
        maxWalletAmount = DEFAULT_MAX_WALLET;
        maxTransactionAmount = DEFAULT_MAX_TRANSACTION;
        limitsEnabled = true;

        // Exempt treasury and owner from limits
        isExempt[treasury] = true;
        isExempt[initialOwner] = true;
        isExempt[address(0)] = true; // Allow burns

        emit ExemptUpdated(treasury, true);
        emit ExemptUpdated(initialOwner, true);

        // Mint entire supply to treasury
        _mint(treasury, MAX_SUPPLY);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Sets whether an address is exempt from transfer limits
    /// @param account Address to update exemption for
    /// @param exempt Whether the address should be exempt
    function setExempt(address account, bool exempt) external onlyOwner {
        isExempt[account] = exempt;
        emit ExemptUpdated(account, exempt);
    }

    /// @notice Enables or disables transfer limits globally
    /// @param enabled Whether limits should be enabled
    function setLimitsEnabled(bool enabled) external onlyOwner {
        limitsEnabled = enabled;
        emit LimitsEnabledUpdated(enabled);
    }

    /// @notice Updates the maximum wallet amount
    /// @param amount New maximum wallet amount
    function setMaxWalletAmount(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        maxWalletAmount = amount;
        emit MaxWalletAmountUpdated(amount);
    }

    /// @notice Updates the maximum transaction amount
    /// @param amount New maximum transaction amount
    function setMaxTransactionAmount(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        maxTransactionAmount = amount;
        emit MaxTransactionAmountUpdated(amount);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL HOOKS
    //////////////////////////////////////////////////////////////*/

    /// @dev Hook that enforces transfer limits
    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        // Check limits if enabled and neither party is exempt
        if (limitsEnabled && !isExempt[from] && !isExempt[to]) {
            // Check max transaction
            if (amount > maxTransactionAmount) {
                revert ExceedsMaxTransaction(amount, maxTransactionAmount);
            }

            // Check max wallet (only for receiving, not for burns)
            if (to != address(0)) {
                uint256 newBalance = balanceOf(to) + amount;
                if (newBalance > maxWalletAmount) {
                    revert ExceedsMaxWallet(to, newBalance, maxWalletAmount);
                }
            }
        }

        super._update(from, to, amount);
    }

    /*//////////////////////////////////////////////////////////////
                           REQUIRED OVERRIDES
    //////////////////////////////////////////////////////////////*/

    /// @dev Required override for ERC20Permit and ERC20Votes
    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
