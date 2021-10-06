// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IwsOHM {
    function unwrap(uint256 _amount) external returns (uint256);
    function wrap(uint256 _amount) external returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function wOHMTosOHM(uint256 _amount) external view returns (uint256);
}