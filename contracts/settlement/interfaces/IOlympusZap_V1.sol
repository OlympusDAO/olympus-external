// SPDX-License-Identifier: WTFPL
pragma solidity >=0.8.0;

interface IOlympusZap_V1 {
    function ZapIn(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address affiliate,
        address bondPayoutToken, // ignored if not bonding
        uint256 maxBondPrice, // ignored if not bonding
        bool bond
    ) external payable returns (uint256 OHMRec);
}
