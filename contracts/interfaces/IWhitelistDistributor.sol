// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Allows whitelisted addresses to claim a token
// Also exposes function from Ownable smart contract openzepplin lib
interface IWhitelistDistributor {
    // User functions
    // Returns the address of the token minted by this contract.
    function token() external view returns (address);
    // Returns true if user can claim a token
    // Returns false if user was whitelisted but has already claimed a token
    function canClaim(address user) external view returns (bool);
    // Returns true if user has claimed a token
    // Returns false if user was never whitelisted to be able to claim
    function hasClaimed(address user) external view returns (bool);
    // Claim the token for msg.sender
    function claim() external;

    // Owner functions
    // Add account to the whitelist
    function whitelistAccount(address account) external;
    // Add multiple accounts to the whitelist
    function batchWhitelistAccounts(address[] calldata accounts) external;
    // Remove account from whitelist
    function blacklistAccount(address account) external;
    // Remove multiple accounts from whitelist
    function batchBlacklistAccounts(address[] calldata accounts) external;

    // This event is triggered whenever a call to #claim succeeds.
    event Claimed(address account);
}