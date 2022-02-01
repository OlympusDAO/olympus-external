// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

interface IBondDepoV2 {
    /**
     * @notice deposit bond
     * @param _bid uint256
     * @param _amount uint256
     * @param _maxPrice uint256
     * @param _depositor address
     * @param _feo address
     * @return payout_ uint256
     * @return expiry_ uint256
     * @return index_ uint256
     */
    function deposit(
        uint256 _bid,
        uint256 _amount,
        uint256 _maxPrice,
        address _depositor,
        address _feo
    )
        external
        returns (
            uint256 payout_,
            uint256 expiry_,
            uint16 index_
        );

    function marketPrice(uint256 _id) external view returns (uint256);

    function bondPriceInUSD(uint16 _bid) external view returns (uint256);

    /**
     * @notice returns data about a bond type
     * @param _BID uint
     * @return principal_ address
     * @return calculator_ address
     * @return totalDebt_ uint
     * @return lastBondCreatedAt_ uint
     */
    function bondInfo(uint256 _BID)
        external
        view
        returns (
            address principal_,
            address calculator_,
            uint256 totalDebt_,
            uint256 lastBondCreatedAt_
        );

    /**
     * @notice returns terms for a bond type
     * @param _BID uint
     * @return controlVariable_ uint
     * @return vestingTerm_ uint
     * @return minimumPrice_ uint
     * @return maxPayout_ uint
     * @return maxDebt_ uint
     */
    function bondTerms(uint256 _BID)
        external
        view
        returns (
            uint256 controlVariable_,
            uint256 vestingTerm_,
            uint256 minimumPrice_,
            uint256 maxPayout_,
            uint256 maxDebt_
        );

    function indexesFor(address _user) external view returns (uint256[] memory);

    function liveMarkets() external view returns (uint256[] memory);
}
