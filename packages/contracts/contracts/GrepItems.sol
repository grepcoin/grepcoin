// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title GrepItems
 * @dev ERC-1155 NFT contract for GrepCoin game items
 *
 * Features:
 * - Multi-token standard for different item types
 * - Batch minting and transfers
 * - Token URI for metadata (IPFS)
 * - Owner can mint, players can transfer
 * - Supply tracking per token
 */
contract GrepItems is ERC1155, ERC1155Burnable, ERC1155Supply, Ownable, Pausable {
    using Strings for uint256;

    // Base URI for token metadata (IPFS gateway)
    string private _baseURI;

    // Mapping from token ID to token URI
    mapping(uint256 => string) private _tokenURIs;

    // Authorized minters (game backend)
    mapping(address => bool) public minters;

    // Item rarity (0=common, 1=rare, 2=epic, 3=legendary)
    mapping(uint256 => uint8) public itemRarity;

    // Item tradability
    mapping(uint256 => bool) public tradeable;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event ItemMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event BatchItemMinted(address indexed to, uint256[] tokenIds, uint256[] amounts);
    event TokenURISet(uint256 indexed tokenId, string uri);
    event BaseURISet(string baseURI);

    constructor(string memory baseURI_) ERC1155(baseURI_) Ownable(msg.sender) {
        _baseURI = baseURI_;
    }

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    /**
     * @dev Add a minter (game backend)
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove a minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Mint a single item to a player
     */
    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        _mint(to, tokenId, amount, data);
        emit ItemMinted(to, tokenId, amount);
    }

    /**
     * @dev Mint multiple items to a player (batch)
     */
    function mintBatch(
        address to,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(tokenIds.length > 0, "Empty token array");
        require(tokenIds.length == amounts.length, "Array length mismatch");
        _mintBatch(to, tokenIds, amounts, data);
        emit BatchItemMinted(to, tokenIds, amounts);
    }

    /**
     * @dev Set metadata for a token
     */
    function setTokenURI(uint256 tokenId, string memory tokenURI) external onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
        emit TokenURISet(tokenId, tokenURI);
    }

    /**
     * @dev Set base URI for all tokens
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURI = baseURI_;
        emit BaseURISet(baseURI_);
    }

    /**
     * @dev Set item rarity
     */
    function setItemRarity(uint256 tokenId, uint8 rarity) external onlyOwner {
        require(rarity <= 3, "Invalid rarity");
        itemRarity[tokenId] = rarity;
    }

    /**
     * @dev Set item tradability
     */
    function setTradeable(uint256 tokenId, bool _tradeable) external onlyOwner {
        tradeable[tokenId] = _tradeable;
    }

    /**
     * @dev Get token URI with metadata
     */
    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        // If token has specific URI, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        // Otherwise, return base URI + token ID
        string memory base = _baseURI;
        return bytes(base).length > 0
            ? string(abi.encodePacked(base, tokenId.toString(), ".json"))
            : "";
    }

    /**
     * @dev Get item info
     */
    function getItemInfo(uint256 tokenId) external view returns (
        uint8 rarity,
        bool isTradeable,
        uint256 supply,
        string memory tokenURI
    ) {
        rarity = itemRarity[tokenId];
        isTradeable = tradeable[tokenId];
        supply = totalSupply(tokenId);
        tokenURI = uri(tokenId);
    }

    /**
     * @dev Get user's items
     */
    function getUserItems(address user, uint256[] memory tokenIds) external view returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            balances[i] = balanceOf(user, tokenIds[i]);
        }
        return balances;
    }

    /**
     * @dev Pause all transfers (emergency)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override required by Solidity for ERC1155Supply
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155, ERC1155Supply) whenNotPaused {
        // Check tradability for transfers (not mints/burns)
        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < ids.length; i++) {
                require(tradeable[ids[i]], "Item not tradeable");
            }
        }
        super._update(from, to, ids, values);
    }
}
