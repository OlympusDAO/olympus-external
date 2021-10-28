// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256 wad) external;
}