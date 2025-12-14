// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IGrepToken is IERC20, IVotes {
    /// @notice Returns the maximum supply of tokens
    function MAX_SUPPLY() external view returns (uint256);

    /// @notice Returns the maximum tokens a wallet can hold (when limits enabled)
    function maxWalletAmount() external view returns (uint256);

    /// @notice Returns the maximum tokens per transaction (when limits enabled)
    function maxTransactionAmount() external view returns (uint256);

    /// @notice Returns whether transfer limits are enabled
    function limitsEnabled() external view returns (bool);

    /// @notice Returns whether an address is exempt from limits
    function isExempt(address account) external view returns (bool);

    /// @notice Burns tokens from the caller's balance
    function burn(uint256 amount) external;

    /// @notice Burns tokens from an account (requires allowance)
    function burnFrom(address account, uint256 amount) external;

    /// @notice Sets whether an address is exempt from transfer limits
    function setExempt(address account, bool exempt) external;

    /// @notice Enables or disables transfer limits
    function setLimitsEnabled(bool enabled) external;

    /// @notice Updates the maximum wallet amount
    function setMaxWalletAmount(uint256 amount) external;

    /// @notice Updates the maximum transaction amount
    function setMaxTransactionAmount(uint256 amount) external;

    /// @notice Emitted when transfer limits are toggled
    event LimitsEnabledUpdated(bool enabled);

    /// @notice Emitted when an address exemption is updated
    event ExemptUpdated(address indexed account, bool exempt);

    /// @notice Emitted when max wallet amount is updated
    event MaxWalletAmountUpdated(uint256 amount);

    /// @notice Emitted when max transaction amount is updated
    event MaxTransactionAmountUpdated(uint256 amount);

    /// @notice Error when transfer exceeds max transaction amount
    error ExceedsMaxTransaction(uint256 amount, uint256 max);

    /// @notice Error when transfer would exceed max wallet amount
    error ExceedsMaxWallet(address account, uint256 balance, uint256 max);

    /// @notice Error when amount is invalid
    error InvalidAmount();
}
