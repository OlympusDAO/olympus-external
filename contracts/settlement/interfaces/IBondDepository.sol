// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;

interface IBondDepository {
  
    // Info about each type of bond
    struct Bond {
        IERC20 principal;               // token to accept as payment
        IBondingCalculator calculator;  // contract to value principal
        Terms terms;                    // terms of bond
        bool termsSet;                  // have terms been set
        uint256 capacity;               // capacity remaining
        bool capacityIsPayout;          // capacity limit is for payout vs principal
        uint256 totalDebt;              // total debt from bond
        uint256 lastDecay;              // last block when debt was decayed
    }

    /**
    * @notice returns Bond Info for a given Bond ID
    * @param _BID uint
    * @return Bond struct
    */
    function bonds( 
        uint _BID
    ) external returns ( Bond );

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
        uint _amount,
        uint _maxPrice,
        address _depositor,
        uint _BID,
        address _feo
    ) external returns (uint, uint);
}