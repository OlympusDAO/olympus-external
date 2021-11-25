// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

interface ICustomBondDepo {
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor
    ) external returns (uint256);

    function bondPrice() external view returns (uint256);

    function payoutFor(uint256 _value) external view returns (uint256);
}
