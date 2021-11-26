// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IERC20.sol";
import "./IBondingCalculator.sol";

interface IBondDepository {
    struct Terms {
        uint256 controlVariable; // scaling variable for price
        uint256 vestingTerm; // in blocks
        uint256 minimumPrice; // vs principle value
        uint256 maxPayout; // in thousandths of a %. i.e. 500 = 0.5%
        uint256 fee; // as % of bond payout, in hundreths. ( 500 = 5% = 0.05 for every 1 paid)
        uint256 maxDebt; // 9 decimal debt ratio, max % total supply created as debt
    }

    // Info about each type of bond
    struct Bond {
        IERC20 principal; // token to accept as payment
        IBondingCalculator calculator; // contract to value principal
        Terms terms; // terms of bond
        bool termsSet; // have terms been set
        uint256 capacity; // capacity remaining
        bool capacityIsPayout; // capacity limit is for payout vs principal
        uint256 totalDebt; // total debt from bond
        uint256 lastDecay; // last block when debt was decayed
    }

    /**
     * @notice returns Bond Info for a given Bond ID
     * @param _BID uint
     * @return Bond struct
     */
    function bonds(uint256 _BID) external returns (Bond memory);

    /**
     * @notice deposit bond
     * @param _amount uint
     * @param _maxPrice uint
     * @param _depositor address
     * @param _BID uint
     * @param _feo address
     * @return uint
     */
    function deposit(
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor,
        uint256 _BID,
        address _feo
    ) external returns (uint256, uint256);
}
