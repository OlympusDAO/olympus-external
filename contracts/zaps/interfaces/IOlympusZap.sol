// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

import "./IStaking.sol";

interface IOlympusZap {
    function update_Staking(IStaking _staking) external;
    function update_sOHM(address _sOHM) external;
    function update_wsOHM(address _wsOHM) external;
    function update_BondDepository(address principal, address depository) external;
}