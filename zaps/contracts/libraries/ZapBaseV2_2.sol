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

/// @author Zapper
/// @notice This abstract contract, which is inherited by Zaps,
/// provides utility functions for moving tokens, checking allowances
/// and balances, performing swaps and other Zaps, and accounting
/// for fees.

// SPDX-License-Identifier: GPL-2.0
pragma solidity ^0.8.0;

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../interfaces/IWETH.sol";

import "./Context.sol";
import "./Address.sol";
import "./SafeERC20.sol";


// Ownable left here as not to confuse Olympus's Ownable
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

abstract contract ZapBaseV2_2 is Ownable {
    using SafeERC20 for IERC20;
    bool public stopped;

    address private constant wethTokenAddress =
        0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    // if true, goodwill is not deducted
    mapping(address => bool) public feeWhitelist;

    uint256 public goodwill;
    // % share of goodwill (0-100 %)
    uint256 affiliateSplit;
    // restrict affiliates
    mapping(address => bool) public affiliates;
    // affiliate => token => amount
    mapping(address => mapping(address => uint256)) public affiliateBalance;
    // token => amount
    mapping(address => uint256) public totalAffiliateBalance;
    // swapTarget => approval status
    mapping(address => bool) public approvedTargets;

    address internal constant ETHAddress =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address internal constant ZapperAdmin =
        0x3CE37278de6388532C3949ce4e886F365B14fB56;

    // circuit breaker modifiers
    modifier stopInEmergency {
        require(!stopped, "Paused");
        _;
    }

    constructor(uint256 _goodwill, uint256 _affiliateSplit) {
        goodwill = _goodwill;
        affiliateSplit = _affiliateSplit;
    }

    /**
    @dev Transfers tokens (including ETH) from msg.sender to this contract
    @dev For use with Zap Ins (takes fee from input if > 0)
    @param token The ERC20 token to transfer to this contract (0 address if ETH)
    @return Quantity of tokens transferred to this contract
     */
    function _pullTokens(
        address token,
        uint256 amount,
        address affiliate,
        bool enableGoodwill
    ) internal virtual returns (uint256) {
        uint256 totalGoodwillPortion;

        if (token == address(0)) {
            require(msg.value > 0, "No ETH sent");

            totalGoodwillPortion = _subtractGoodwill(
                ETHAddress,
                msg.value,
                affiliate,
                enableGoodwill
            );

            return msg.value - totalGoodwillPortion;
        }

        require(amount > 0, "Invalid token amount");
        require(msg.value == 0, "ETH sent with token");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        totalGoodwillPortion = _subtractGoodwill(
            token,
            amount,
            affiliate,
            enableGoodwill
        );

        return amount - totalGoodwillPortion;
    }

    /**
    @dev Transfers tokens from msg.sender to this contract
    @dev For use with Zap Outs (does not transfer ETH)
    @param token The ERC20 token to transfer to this contract
    @return Quantity of tokens transferred to this contract
     */
    function _pullTokens(address token, uint256 amount)
        internal
        virtual
        returns (uint256)
    {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        return amount;
    }

    /**
    @dev Fulfills an encoded swap or Zap if the target is approved
    @param fromToken The sell token
    @param toToken The buy token
    @param amount The quantity of fromToken to sell
    @param swapTarget The execution target for the swapData
    @param swapData The swap data encoding the swap or Zap
    @return amountBought Quantity of tokens toToken acquired
     */
    function _fillQuote(
        address fromToken,
        address toToken,
        uint256 amount,
        address swapTarget,
        bytes memory swapData
    ) internal virtual returns (uint256 amountBought) {
        if (fromToken == toToken) {
            return amount;
        }

        if (fromToken == address(0) && toToken == wethTokenAddress) {
            IWETH(wethTokenAddress).deposit{ value: amount }();
            return amount;
        }

        if (fromToken == wethTokenAddress && toToken == address(0)) {
            IWETH(wethTokenAddress).withdraw(amount);
            return amount;
        }

        uint256 valueToSend;
        if (fromToken == address(0)) {
            valueToSend = amount;
        } else {
            _approveToken(fromToken, swapTarget, amount);
        }

        uint256 initialBalance = _getBalance(toToken);

        require(approvedTargets[swapTarget], "Target not Authorized");
        (bool success, ) = swapTarget.call{ value: valueToSend }(swapData);
        require(success, "Error Swapping Tokens");

        amountBought = _getBalance(toToken) - initialBalance;

        require(amountBought > 0, "Swapped To Invalid Token");
    }

    /**
    @notice Gets this contract's balance of a token
    @param token The ERC20 token to check the balance of (0 address if ETH)
    @return balance This contract's token balance
     */
    function _getBalance(address token)
        internal
        view
        returns (uint256 balance)
    {
        if (token == address(0)) {
            balance = address(this).balance;
        } else {
            balance = IERC20(token).balanceOf(address(this));
        }
    }

    /**
    @notice Approve a token for spending with infinite allowance
    @param token The ERC20 token to approve
    @param spender The spender of the token
     */
    function _approveToken(address token, address spender) internal {
        IERC20 _token = IERC20(token);
        if (_token.allowance(address(this), spender) > 0) return;
        else {
            _token.safeApprove(spender, type(uint256).max);
        }
    }

    /**
    @notice Approve a token for spending with finite allowance
    @param token The ERC20 token to approve
    @param spender The spender of the token
    @param amount The allowance to grant to the spender
     */
    function _approveToken(
        address token,
        address spender,
        uint256 amount
    ) internal {
        IERC20(token).safeApprove(spender, 0);
        IERC20(token).safeApprove(spender, amount);
    }

    /**
    @notice Set address to true to bypass fees when calling this contract
    @param zapAddress The Zap caller which is allowed to bypass fees (if > 0)
    @param status The whitelisted status (true if whitelisted)
     */
    function set_feeWhitelist(address zapAddress, bool status)
        external
        onlyOwner
    {
        feeWhitelist[zapAddress] = status;
    }

    /** 
    @notice Sets a goodwill amount
    @param _new_goodwill The new goodwill amount between 0-1%
     */
    function set_new_goodwill(uint256 _new_goodwill) public onlyOwner {
        require(
            _new_goodwill >= 0 && _new_goodwill <= 100,
            "GoodWill Value not allowed"
        );
        goodwill = _new_goodwill;
    }

    /** 
    @notice Sets the percentage to split the goodwill by to distribute
    * to affiliates
    @param _new_affiliateSplit The new affiliate split between 0-1%
     */
    function set_new_affiliateSplit(uint256 _new_affiliateSplit)
        external
        onlyOwner
    {
        require(
            _new_affiliateSplit <= 100,
            "Affiliate Split Value not allowed"
        );
        affiliateSplit = _new_affiliateSplit;
    }

    /** 
    @notice Adds or removes an affiliate
    @param _affiliate The  affiliate's address
    @param _status The affiliate's approval status
     */
    function set_affiliate(address _affiliate, bool _status)
        external
        onlyOwner
    {
        affiliates[_affiliate] = _status;
    }

    /** 
    @notice Withdraws goodwill share, retaining affilliate share
    @param tokens An array of the tokens to withdraw (0xeee address if ETH)
     */
    function withdrawTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 qty;

            if (tokens[i] == ETHAddress) {
                qty = address(this).balance - totalAffiliateBalance[tokens[i]];

                Address.sendValue(payable(owner()), qty);
            } else {
                qty =
                    IERC20(tokens[i]).balanceOf(address(this)) -
                    totalAffiliateBalance[tokens[i]];
                IERC20(tokens[i]).safeTransfer(owner(), qty);
            }
        }
    }

    /** 
    @notice Withdraws the affilliate share, retaining goodwill share
    @param tokens An array of the tokens to withdraw (0xeee address if ETH)
     */
    function affilliateWithdraw(address[] calldata tokens) external {
        uint256 tokenBal;
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenBal = affiliateBalance[msg.sender][tokens[i]];
            affiliateBalance[msg.sender][tokens[i]] = 0;
            totalAffiliateBalance[tokens[i]] =
                totalAffiliateBalance[tokens[i]] -
                tokenBal;

            if (tokens[i] == ETHAddress) {
                Address.sendValue(payable(msg.sender), tokenBal);
            } else {
                IERC20(tokens[i]).safeTransfer(msg.sender, tokenBal);
            }
        }
    }

    /**
    @dev Adds or removes an approved swapTarget
    * swapTargets should be Zaps and must not be tokens!
    @param targets An array of addresses of approved swapTargets
    */
    function setApprovedTargets(
        address[] calldata targets,
        bool[] calldata isApproved
    ) external onlyOwner {
        require(targets.length == isApproved.length, "Invalid Input length");

        for (uint256 i = 0; i < targets.length; i++) {
            approvedTargets[targets[i]] = isApproved[i];
        }
    }

    /** 
    @dev Subtracts the goodwill amount from the `amount` param
    @param token The ERC20 token being sent (0 address if ETH)
    @param amount The quantity of the token being sent
    @param affiliate The  affiliate's address
    @param enableGoodwill True if bypassing goodwill, false otherwise
    @return totalGoodwillPortion The quantity of `token` that should be
    * subtracted from `amount`
     */
    function _subtractGoodwill(
        address token,
        uint256 amount,
        address affiliate,
        bool enableGoodwill
    ) internal returns (uint256 totalGoodwillPortion) {
        bool whitelisted = feeWhitelist[msg.sender];
        if (goodwill > 0 && enableGoodwill && !whitelisted) {
            totalGoodwillPortion = (amount * goodwill) / 10000;

            if (affiliates[affiliate]) {
                if (token == address(0)) {
                    token = ETHAddress;
                }

                uint256 affiliatePortion =
                    (totalGoodwillPortion * affiliateSplit) / 100;
                affiliateBalance[affiliate][token] += affiliatePortion;
                totalAffiliateBalance[token] += affiliatePortion;
            }
        }
    }

    /**
    @dev Toggles the contract's active state
     */
    function toggleContractActive() public onlyOwner {
        stopped = !stopped;
    }

    receive() external payable {
        require(msg.sender != tx.origin, "Do not send ETH directly");
    }
}