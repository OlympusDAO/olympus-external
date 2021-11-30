// SPDX-License-Identifier: GPL-2.0
pragma solidity 0.7.5;

interface IDepository {
    function bondPriceInUSD() external view returns (uint price_);
    function principle() external view returns (address);
}

contract CheapestBondHelper {

    //////////////// State ////////////////

    IDepository[] public depos;

    address public OlympusDAO;

    //////////////// Init ////////////////

    constructor (IDepository[] memory _depos) {
        depos = _depos;

        OlympusDAO = msg.sender;
    }


    ///////////// Policy Only /////////////

    function update_Depos(IDepository[] memory _depos) external {
        require(msg.sender == OlympusDAO);
        depos = _depos;
    }

    function pushOwnership(address who) external {
        require(msg.sender == OlympusDAO);
        OlympusDAO = who;
    }

    //////////////// Public ////////////////

    function getCheapestBond() external view returns (IDepository cheapestDepo, address principle) {

        uint256 cheapestPrice = type(uint256).max;

        for (uint256 i; i < depos.length; i++) {

            uint256 price = depos[i].bondPriceInUSD();
            
            if (price <= cheapestPrice) {
                cheapestPrice = price;
                cheapestDepo = depos[i];
            }
        }

        principle = cheapestDepo.principle();
    }
}
