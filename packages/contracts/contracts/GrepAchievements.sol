// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title GrepAchievements
 * @dev ERC-1155 NFT badges for achievements in the GrepCoin Arcade
 */
contract GrepAchievements is ERC1155, EIP712, Ownable, Pausable {
    using ECDSA for bytes32;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(address player,uint256 achievementId,uint256 nonce)");

    address public signer;
    mapping(address => mapping(uint256 => bool)) public claimed;
    mapping(address => uint256) public nonces;

    event AchievementClaimed(address indexed player, uint256 indexed achievementId, uint256 nonce);
    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event URIUpdated(string newUri);

    constructor(string memory _baseUri, address _signer)
        ERC1155(_baseUri)
        EIP712("GrepAchievements", "1")
        Ownable(msg.sender)
    {
        require(_signer != address(0), "Invalid signer address");
        signer = _signer;
    }

    function claim(uint256 achievementId, bytes calldata signature) external whenNotPaused {
        address player = msg.sender;
        require(!claimed[player][achievementId], "Achievement already claimed");

        uint256 currentNonce = nonces[player];
        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, player, achievementId, currentNonce)
        );
        bytes32 hash = _hashTypedDataV4(structHash);
        address recoveredSigner = hash.recover(signature);
        require(recoveredSigner == signer, "Invalid signature");

        claimed[player][achievementId] = true;
        nonces[player] = currentNonce + 1;
        _mint(player, achievementId, 1, "");

        emit AchievementClaimed(player, achievementId, currentNonce);
    }

    function hasClaimed(address player, uint256 achievementId) external view returns (bool) {
        return claimed[player][achievementId];
    }

    function getNonce(address player) external view returns (uint256) {
        return nonces[player];
    }

    function setSigner(address newSigner) external onlyOwner {
        require(newSigner != address(0), "Invalid signer address");
        address oldSigner = signer;
        signer = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
        emit URIUpdated(newUri);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override whenNotPaused {
        super._update(from, to, ids, values);
    }

    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }

    function getClaimHash(
        address player,
        uint256 achievementId,
        uint256 nonce
    ) external view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(CLAIM_TYPEHASH, player, achievementId, nonce)
        );
        return _hashTypedDataV4(structHash);
    }
}
