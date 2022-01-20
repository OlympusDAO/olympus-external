// ███████╗░█████╗░██████╗░██████╗░███████╗██████╗░░░░███████╗██╗
// ╚════██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗░░░██╔════╝██║
// ░░███╔═╝███████║██████╔╝██████╔╝█████╗░░██████╔╝░░░█████╗░░██║
// ██╔══╝░░██╔══██║██╔═══╝░██╔═══╝░██╔══╝░░██╔══██╗░░░██╔══╝░░██║
// ███████╗██║░░██║██║░░░░░██║░░░░░███████╗██║░░██║██╗██║░░░░░██║
// ╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝╚═╝░░░░░╚═╝
// Copyright (C) 2021 zapper

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//

/// @author Zapper and OlympusDAO
/// @notice This contract enters/exits OlympusDAO Ω with/to any token.
/// Bonds can also be created on behalf of msg.sender using any input token.

// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

import "./interfaces/IBondHelper.sol";
import "./interfaces/IBondDepoV2.sol";
import "./interfaces/IStakingV2.sol";
import "./interfaces/IsOHMv2.sol";
import "./interfaces/IgOHM.sol";
import "./libraries/ZapBaseV3.sol";

contract Olympus_V2_Zap_V1 is ZapBaseV3 {
    using SafeERC20 for IERC20;

    ////////////////////////// STORAGE //////////////////////////

    address public olympusDAO;

    address public depo;

    address public staking;

    address public immutable OHM;

    address public immutable sOHM;

    address public immutable gOHM;

    IBondHelper public bondHelper;

    ////////////////////////// EVENTS //////////////////////////

    // Emitted when `sender` Zaps In
    event zapIn(address sender, address token, uint256 tokensRec, address affiliate);

    // Emitted when `sender` Zaps Out
    event zapOut(address sender, address token, uint256 tokensRec, address affiliate);

    ////////////////////////// MODIFIERS //////////////////////////

    modifier onlyOlympusDAO() {
        require(msg.sender == olympusDAO, "Only OlympusDAO");
        _;
    }

    ////////////////////////// CONSTRUCTION //////////////////////////

    constructor(
        address _olympusDAO,
        address _depo,
        address _staking,
        address _OHM,
        address _sOHM,
        address _gOHM,
        uint256 _goodwill,
        uint256 _affiliateSplit,
        IBondHelper _bondHelper
    ) ZapBaseV3(_goodwill, _affiliateSplit) {
        // 0x Proxy
        approvedTargets[0xDef1C0ded9bec7F1a1670819833240f027b25EfF] = true;
        // Zapper Sushiswap Zap In
        approvedTargets[0x5abfbE56553a5d794330EACCF556Ca1d2a55647C] = true;
        // Zapper Uniswap V2 Zap In
        approvedTargets[0x6D9893fa101CD2b1F8D1A12DE3189ff7b80FdC10] = true;

        olympusDAO = _olympusDAO;
        depo = _depo;
        staking = _staking;
        OHM = _OHM;
        sOHM = _sOHM;
        gOHM = _gOHM;
        bondHelper = _bondHelper;

        transferOwnership(_olympusDAO);
    }

    ////////////////////////// PUBLIC //////////////////////////

    /// @notice This function deposits assets into Olympus with ETH or ERC20 tokens
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The amount of fromToken to invest
    /// @param toToken The token fromToken is getting converted to
    /// @param minToToken The minimum acceptable quantity sOHM
    /// or gOHM or principal tokens to receive. Reverts otherwise
    /// @param swapTarget Excecution target for the swap
    /// @param swapData DEX or Zap data. Must swap to ibToken underlying address
    /// @param affiliate Affiliate address
    /// @return OHMRec quantity of sOHM or gOHM  received (depending on toToken)
    function ZapStake(
        address fromToken,
        uint256 amountIn,
        address toToken,
        uint256 minToToken,
        address swapTarget,
        bytes calldata swapData,
        address affiliate
    ) external payable stopInEmergency returns (uint256 OHMRec) {
        uint256 toInvest = _pullTokens(fromToken, amountIn, affiliate, true);

        // approve "swapTarget" to spend this contracts "fromToken" if needed
        _approveToken(fromToken, swapTarget, toInvest);
        uint256 tokensBought = _fillQuote(fromToken, OHM, toInvest, swapTarget, swapData);

        OHMRec = _enterOlympus(tokensBought, toToken);
        require(OHMRec > minToToken, "High Slippage");
        emit zapIn(msg.sender, sOHM, OHMRec, affiliate);
    }

    /// @notice This function acquires Olympus bonds with ETH or ERC20 tokens
    /// @param fromToken The token used for entry (address(0) if ether)
    /// @param amountIn The amount of fromToken to invest
    /// @param principal The token fromToken is getting converted to
    /// ignored if useCheapestBond is true
    /// @param swapTarget Excecution target for the zap
    /// @param swapData DEX or Zap data. Must swap to ibToken underlying address
    /// @param affiliate Affiliate address
    /// @param maxBondSlippage Max price for a bond denominated in toToken/principal
    /// @param useCheapestBond Automatically find the cheapest bond to use to acquire bond
    /// @return OHMRec quantity of sOHM or gOHM  received (depending on toToken)
    /// or the quantity OHM vesting (if bond is true)
    function ZapBond(
        address fromToken,
        uint256 amountIn,
        address principal,
        address swapTarget,
        bytes calldata swapData,
        address affiliate,
        uint256 maxBondSlippage, // in bips
        bool useCheapestBond
    ) external payable stopInEmergency returns (uint256 OHMRec) {
        // pull users fromToken
        uint256 toInvest = _pullTokens(fromToken, amountIn, affiliate, true);
        // fetch cheapest BID in terms of USD, and relevant principal
        uint16 bid;
        if (useCheapestBond) {
            (bid, ) = bondHelper.getCheapestBID();
        } else {
            bid = bondHelper.getBID(principal);
        }
        // make sure "swapTarget" is approved to spend this contracts "fromToken"
        _approveToken(fromToken, swapTarget, toInvest);
        // swap fromToken -> cheapest bond principal
        uint256 tokensBought = _fillQuote(
            fromToken,
            principal, // to token
            toInvest,
            swapTarget,
            swapData
        );
        // max sure bond depo is approved to spend this contracts "principal"
        _approveToken(principal, depo, tokensBought);
        // purchase bond
        (OHMRec, ) = IBondDepoV2(depo).deposit(
            msg.sender, // depositor
            bid,
            tokensBought,
            // bond price * slippage % + bond price
            (IBondDepoV2(depo).bondPrice(bid) * maxBondSlippage) /
                1e4 +
                IBondDepoV2(depo).bondPrice(bid),
            affiliate
        );
        // emit zapIn
        emit zapIn(msg.sender, principal, OHMRec, affiliate);
    }

    ////////////////////////// INTERNAL //////////////////////////

    function _enterOlympus(uint256 amount, address toToken) internal returns (uint256) {
        uint256 claimedTokens;

        if (toToken == gOHM) {
            // max approve staking for OHM if needed
            _approveToken(OHM, staking, amount);
            // stake OHM -> gOHM
            IStaking(staking).stake(address(this), amount, false, false);
            claimedTokens = IStaking(staking).claim(address(this), false);

            IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

            return claimedTokens;
        }

        // max approve staking for OHM if needed
        _approveToken(OHM, staking, amount);
        // stake OHM -> sOHM

        IStaking(staking).stake(address(this), amount, true, false);
        claimedTokens = IStaking(staking).claim(address(this), true);

        IERC20(toToken).safeTransfer(msg.sender, claimedTokens);

        return claimedTokens;
    }

    function removeLiquidityReturn(address fromToken, uint256 fromAmount)
        external
        view
        returns (uint256 ohmAmount)
    {
        if (fromToken == sOHM) {
            return fromAmount;
        } else if (fromToken == gOHM) {
            return IsOHM(sOHM).fromG(fromAmount);
        }
    }

    ////////////////////////// OLYMPUS ONLY //////////////////////////

    /// @notice update olympus dao address, which is used for access control
    function update_OlympusDAO(address _olympusDAO) external onlyOlympusDAO {
        olympusDAO = _olympusDAO;
    }

    /// @notice update state for staking
    function update_Staking(address _staking) external onlyOlympusDAO {
        staking = _staking;
    }

    /// @notice update state for depo
    function update_Depo(address _depo) external onlyOlympusDAO {
        depo = _depo;
    }

    /// @notice update max approvals for tokens to reduce user gas cost
    function update_approvals(IERC20[] memory _tokens, address _target) external onlyOlympusDAO {
        for (uint256 i; i < _tokens.length; i++) {
            _tokens[i].approve(_target, type(uint256).max);
        }
    }

    /// @notice update state for Cheapest Bond Helper
    function update_bondHelper(IBondHelper _bondHelper) external onlyOlympusDAO {
        bondHelper = _bondHelper;
    }

    ////////////////////////// INTERNAL HELPERS //////////////////////////
}
