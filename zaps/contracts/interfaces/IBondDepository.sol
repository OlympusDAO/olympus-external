// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IBondDepository {
    function deposit(uint _amount, uint _maxPrice, address _depositor) external returns ( uint );
    function payoutFor( uint _value ) external view returns ( uint );
    function bondPrice() external view returns (uint256 price_);

}