// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

interface IBondHelper {
    function getCheapestBID() external view returns (uint16, address);

    function getBID(address principal) external view returns (uint16);
}
