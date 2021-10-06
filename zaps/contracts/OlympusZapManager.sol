// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

import "./interfaces/IOlympusZap.sol";
import "./libraries/Ownable.sol";

contract OlympusZapManager is Ownable {

    IOlympusZap public OlympusZap;

    constructor( IOlympusZap _olympusZap ) {
        OlympusZap = _olympusZap;
    }

    function update_Staking(
        IStaking _staking
    ) external onlyOwner {
        OlympusZap.update_Staking( _staking );
    }

    function update_sOHM(
        address _sOHM
    ) external onlyOwner {
        OlympusZap.update_sOHM( _sOHM );
    }

    function update_wsOHM(
        address _wsOHM
    ) external onlyOwner {
        OlympusZap.update_wsOHM( _wsOHM );
    }

    function update_BondDepository(
        address principal, 
        address depository
    ) external onlyOwner {
        OlympusZap.update_BondDepository( principal, depository );
    }
}