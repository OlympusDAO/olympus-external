// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

import "./interfaces/IBondDepository.sol";

import "./libraries/Ownable.sol";

contract OlympusZapManager is Ownable {


    /////////////// storage ///////////////

    address public staking = 0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a;

    address public constant OHM = 0x383518188C0C6d7730D91b2c03a03C837814a899;

    address public sOHM = 0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F;

    address public wsOHM = 0xCa76543Cf381ebBB277bE79574059e32108e3E65;

    // IE DAI => DAI bond depo
    mapping(address => address) public principalToDepository;

    ///////////// public logic ////////////

    function deposit(
        address _depositor,
        address _principal,
        uint _amount,
        uint _maxBondPrice
    ) external returns ( uint ) {
        address depository = principalToDepository[ _principal ];
        // make sure market exists for given principal/toToken
        require( principalToDepository[ _principal ] != address(0), "bonding market doesn't exist");
        // buy bond on the behalf of user
        IBondDepository( depository ).deposit( _amount, _maxBondPrice, _depositor );
        // return OHM payout for the given bond
        return IBondDepository( depository ).payoutFor( _amount );
    }

    ///////////// policy only /////////////

    function update_Staking(
        address _staking
    ) external onlyOwner {
        staking = _staking;
    }

    function update_sOHM(
        address _sOHM
    ) external onlyOwner {
       sOHM = _sOHM;
    }

    function update_wsOHM(
        address _wsOHM
    ) external onlyOwner {
        wsOHM = _wsOHM;
    }

    function update_BondDepos(
        address[] calldata principals, 
        address[] calldata depos
    ) external onlyOwner {
        require( principals.length == depos.length, "array param lengths must match");
        // update depos for each principal
        for ( uint i; i < principals.length; i++) {
            principalToDepository[ principals[ i ] ] = depos[ i ];
        }
    }
}
