// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IBondingCalculator {
    function valuation(address pair_, uint256 amount_) external view returns (uint256 _value);
}
