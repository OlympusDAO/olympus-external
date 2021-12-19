// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

interface ICheapestBondHelper {
    function getCheapestBID() external view returns (uint16, address);
}
