// SPDX-License-Identifier: AGPL-3.0-or-later

/// @title Olympus V2 Zap In
/// @author Zapper, Cryptonomik, Dionysus
/// Copyright (C) 2021 Zapper
/// Copyright (C) 2022 OlympusDAO

pragma solidity 0.8.4;

import "./interfaces/IBondDepoV2.sol";
import "./interfaces/IStakingV2.sol";
import "./interfaces/IsOHMv2.sol";
import "./interfaces/IgOHM.sol";
import "./libraries/ZapBaseV3.sol";

contract Olympus_V2_Zap_In is ZapBaseV3 {
    using SafeERC20 for IERC20;

    ////////////////////////// STORAGE //////////////////////////

    address public depo;

    address public staking;

    address public immutable OHM;

    address public immutable sOHM;

    address public immutable gOHM;

    ////////////////////////// EVENTS //////////////////////////

    // Emitted when `sender` successfully calls ZapStake
    event zapStake(address sender, address token, uint256 tokensRec, address referral);

    // Emitted when `sender` successfully calls ZapBond
    event zapBond(address sender, address token, uint256 tokensRec, address referral);

    ////////////////////////// CONSTRUCTION //////////////////////////
    constructor(
        address _depo,
        address _staking,
        address _OHM,
        address _sOHM,
        address _gOHM
    ) ZapBaseV3(0, 0) {
        // 0x Proxy
        approvedTargets[0xDef1C0ded9bec7F1a1670819833240f027b25EfF] = true;
        // Zapper Sushiswap Zap In
        approvedTargets[0x5abfbE56553a5d794330EACCF556Ca1d2a55647C] = true;
        // Zapper Uniswap V2 Zap In
        approvedTargets[0x6D9893fa101CD2b1F8D1A12DE3189ff7b80FdC10] = true;

        depo = _depo;
        staking = _staking;
        OHM = _OHM;
        sOHM = _sOHM;
        gOHM = _gOHM;
    }

    ////////////////////////// PUBLIC //////////////////////////

    /// @notice This function acquires OHM with ETH or ERC20 tokens and stakes it for sOHM/gOHM
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The quantity of fromToken being sent
    /// @param toToken The token fromToken is being converted to (i.e. sOHM or gOHM)
    /// @param minToToken The minimum acceptable quantity sOHM or gOHM to receive. Reverts otherwise
    /// @param swapTarget Excecution target for the swap
    /// @param swapData DEX swap data
    /// @param referral The front end operator address
    /// @return OHMRec The quantity of sOHM or gOHM received (depending on toToken)
    function ZapStake(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address referral
    ) external payable pausable returns (uint256 OHMRec) {
        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, referral, true);

        // approve "swapTarget" to spend this contracts "fromToken" if needed
        _approveToken(fromToken, swapTarget, toInvest);

        // swap fromToken -> OHM
        uint256 tokensBought = _fillQuote(fromToken, OHM, toInvest, swapTarget, swapData);

        // stake OHM for sOHM or gOHM
        OHMRec = _stake(tokensBought, toToken);

        // Slippage check
        require(OHMRec > minToToken, "High Slippage");

        emit zapStake(msg.sender, toToken, OHMRec, referral);
    }

    /// @notice This function acquires Olympus bonds with ETH or ERC20 tokens
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The quantity of fromToken being sent
    /// @param principal The token fromToken is being converted to (i.e. token or LP to bond)
    /// @param swapTarget Excecution target for the swap or Zap
    /// @param swapData DEX or Zap data
    /// @param referral The front end operator address
    /// @param maxPrice The maximum price at which to buy the bond
    /// @param bondId The ID of the market
    /// @return OHMRec The quantity of gOHM due
    function ZapBond(
        address fromToken,
        uint256 amountIn,
        address principal,
        address swapTarget,
        bytes calldata swapData,
        address referral,
        uint256 maxPrice,
        uint256 bondId
    ) external payable pausable returns (uint256 OHMRec) {
        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, referral, true);

        // make sure "swapTarget" is approved to spend this contracts "fromToken"
        _approveToken(fromToken, swapTarget, toInvest);
        // swap fromToken -> bond principal
        uint256 tokensBought = _fillQuote(
            fromToken,
            principal, // to token
            toInvest,
            swapTarget,
            swapData
        );

        // make sure bond depo is approved to spend this contracts "principal"
        _approveToken(principal, depo, tokensBought);

        // purchase bond
        (OHMRec, , ) = IBondDepoV2(depo).deposit(
            bondId,
            tokensBought,
            maxPrice,
            msg.sender, // depositor
            referral
        );

        emit zapBond(msg.sender, principal, OHMRec, referral);
    }

    ////////////////////////// INTERNAL //////////////////////////

    /// @param amount The quantity of OHM being staked
    /// @param toToken Either sOHM or gOHM
    /// @return OHMRec quantity of sOHM or gOHM  received (depending on toToken)
    function _stake(uint256 amount, address toToken) internal returns (uint256) {
        uint256 claimedTokens;
        // approve staking for OHM if needed
        _approveToken(OHM, staking, amount);

        if (toToken == gOHM) {
            // stake OHM -> gOHM
            claimedTokens = IStaking(staking).stake(address(this), amount, false, true);

            IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

            return claimedTokens;
        }
        // stake OHM -> sOHM
        claimedTokens = IStaking(staking).stake(address(this), amount, true, true);

        IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

        return claimedTokens;
    }

    ////////////////////////// OLYMPUS ONLY //////////////////////////
    /// @notice update state for staking
    function update_Staking(address _staking) external onlyOwner {
        staking = _staking;
    }

    /// @notice update state for depo
    function update_Depo(address _depo) external onlyOwner {
        depo = _depo;
    }
}
