// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IBondDepository {
    // Info for bond holder
    struct Bond {
        uint256 payout; // OHM remaining to be paid
        uint256 vesting; // Blocks left to vest
        uint256 lastBlock; // Last interaction
        uint256 pricePaid; // In DAI, for front end viewing
    }

    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor
    ) external returns (uint256);

    function payoutFor(uint256 _value) external view returns (uint256);

    function bondInfo(address _account) external view returns (Bond memory);

    function bondPrice() external view returns (uint256 price_);
}
