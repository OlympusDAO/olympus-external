pragma solidity ^0.8.0;

interface IBondDepoV2 {
    /**
     * @notice deposit bond
     * @param _depositor address
     * @param _bid uint256
     * @param _amount uint256
     * @param _maxPrice uint256
     * @param _feo address
     * @return payout_ uint256
     * @return index_ uint256
     */
    function deposit(
        address _depositor,
        uint16 _bid,
        uint256 _amount,
        uint256 _maxPrice,
        address _feo
    ) external returns (uint256 payout_, uint16 index_);

    function bondPrice(uint16 _bid) external view returns (uint256);

    function bondPriceInUSD(uint16 _bid) external view returns (uint256);
}
