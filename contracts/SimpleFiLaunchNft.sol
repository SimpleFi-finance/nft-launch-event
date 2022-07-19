// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyToken is ERC721, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  /// Base token URI used as a prefix by tokenURI().
  string public baseTokenURI;
  /// while true, anyone can mint the NFT
  bool public isOpenForPublic;
  /// tracks users who can claim the drop
  mapping(address => bool) public minters;
  /// tracks users who claimed the drop
  mapping(address => bool) public claimed;

  event Claimed(address indexed account);
  event Whitelisted(address indexed account);

  constructor(string memory _baseTokenURI) ERC721("MyToken", "MTK") {
    baseTokenURI = _baseTokenURI;
    isOpenForPublic = true;
  }

  // mint the NFT to msg.sender if minting is open, or if sender is whitelisted
  function claim() public {
    require(!claimed[_msgSender()], "User already claimed NFT!");
    require(isOpenForPublic || !claimed[_msgSender()], "User not eligible to claim NFT!");

    claimed[_msgSender()] = true;

    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(_msgSender(), tokenId);

    emit Claimed(_msgSender());
  }

  /// Returns an URI for a given token ID
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  /// Sets the base token URI prefix.
  function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
    baseTokenURI = _baseTokenURI;
  }

  // Controls if anyone can mint NFT or only the whitelisted accounts
  function setPublicMinting(bool _isOpenForPublic) public onlyOwner {
    isOpenForPublic = _isOpenForPublic;
  }

  // add account to the whitelist
  function whitelistAccount(address account) public onlyOwner {
    minters[account] = true;
    emit Whitelisted(account);
  }

  function canClaim(address user) public view returns (bool) {
    return !claimed[user] && (isOpenForPublic || minters[user]);
  }

  function hasClaimed(address user) public view returns (bool) {
    return claimed[user];
  }
}
