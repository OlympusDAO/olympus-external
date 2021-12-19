// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

import "./interfaces/IBondDepoV2.sol";

contract CheapestBondHelper {
    ////////////////////////// STORAGE //////////////////////////

    /// @notice used for access control
    address public olympusDAO = msg.sender;

    /// @notice needed since we can't access IDS length in v2 bond depo
    mapping(address => uint16) public principalToBID;

    /// @notice stores all principals for ohm depo
    address[] public principals;

    /// @notice V2 olympus bond depository
    address public depov2;

    ////////////////////////// MODIFIERS //////////////////////////

    modifier onlyOlympusDAO() {
        require(msg.sender == olympusDAO, "Only OlympusDAO");
        _;
    }

    ////////////////////////// CONSTRUCTOR //////////////////////////

    constructor(address[] memory _principals) {
        principals = _principals;
    }

    ////////////////////////// PUBLIC VIEW //////////////////////////

    /// @notice returns (cheap bond ID, principal)
    function getCheapestBID() external view returns (uint16, address) {
        // set cheapest price to a very large number so we can check against it
        uint256 cheapestPrice = type(uint256).max;
        uint16 cheapestBID;
        address cheapestPrincipal;

        for (uint256 i; i < principals.length; i++) {
            uint16 BID = principalToBID[principals[i]];
            uint256 price = IBondDepoV2(depov2).bondPriceInUSD(BID);

            // TODO check if bonds are sold out for given principal

            if (price <= cheapestPrice) {
                cheapestPrice = price;
                cheapestBID = BID;
                cheapestPrincipal = principals[i];
            }
        }
        return (cheapestBID, cheapestPrincipal);
    }

    ////////////////////////// ONLY OLYMPUS //////////////////////////

    function update_OlympusDAO(address _newOlympusDAO) external onlyOlympusDAO {
        olympusDAO = _newOlympusDAO;
    }

    function update_principalToBondId(address _principal, uint16 _bondId) external onlyOlympusDAO {
        principalToBID[_principal] = _bondId;
    }

    function update_principals(address[] memory _principals) external onlyOlympusDAO {
        principals = _principals;
    }
}
