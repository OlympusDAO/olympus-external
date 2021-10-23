// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IBondDepository {
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor
    ) external returns (uint256);

    function payoutFor(uint256 _value) external view returns (uint256);

    function bondPrice() external view returns (uint256 price_);

    function bondInfo(address _depositor)
        external
        view
        returns (
            uint256 payout,
            uint256 vesting,
            uint256 lastBlock,
            uint256 pricePaid
        );
}
