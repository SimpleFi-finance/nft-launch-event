// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMinter.sol";
import "./interfaces/IWhitelistDistributor.sol";

contract Erc721WhitelistDistributor is IWhitelistDistributor, Ownable {
  address public immutable override token;
  // tracks users who can claim the drop
  mapping(address => bool) public minters;
  // tracks users who claimed the drop
  mapping(address => bool) public claimed;

  constructor(address token_, address[] memory accounts) {
    token = token_;
    uint256 arrayLength = accounts.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      minters[accounts[i]] = true;
    }
  }

  // User functions
  // Returns true if user can claim a token
  // Returns false if user was whitelisted but has already claimed a token
  function canClaim(address user) public view override returns (bool) {
    return minters[user] && !claimed[user];
  }

  // Returns true if user has claimed a token
  // Returns false if user was never whitelisted to be able to claim
  function hasClaimed(address user) public view override returns (bool) {
    return claimed[user];
  }

  // Claim the token for msg.sender
  function claim() external override {
    require(minters[_msgSender()], "WhitelistDistributor: Not allowed to mint.");
    require(!claimed[_msgSender()], "WhitelistDistributor: Drop already claimed.");

    // Mark it claimed and send the token.
    claimed[_msgSender()] = true;
    IMinter(token).mint(_msgSender());

    emit Claimed(_msgSender());
  }

  // Owner functions
  // Add account to the whitelist
  function whitelistAccount(address account) external override onlyOwner {
    minters[account] = true;
  }

  // Add multiple accounts to the whitelist
  function batchWhitelistAccounts(address[] calldata accounts) external override onlyOwner {
    uint256 arrayLength = accounts.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      minters[accounts[i]] = true;
    }
  }

  // Remove account from whitelist if not claimed already
  function blacklistAccount(address account) external override onlyOwner {
    require(!claimed[account], "WhitelistDistributor: Drop already claimed.");
    minters[account] = false;
  }

  // Remove multiple accounts from whitelist if not already claimed
  function batchBlacklistAccounts(address[] calldata accounts) external override onlyOwner {
    uint256 arrayLength = accounts.length;
    for (uint256 i = 0; i < arrayLength; i++) {
      require(
        !claimed[accounts[i]],
        "WhitelistDistributor: Drop already claimed by one of the accounts"
      );
      minters[accounts[i]] = false;
    }
  }
}
