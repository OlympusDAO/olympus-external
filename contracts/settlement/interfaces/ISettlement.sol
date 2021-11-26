// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../libraries/Orders.sol";

interface ISettlement {
    event OrderFilled(bytes32 indexed hash, uint amount, uint amountOut);
    event OrderCanceled(bytes32 indexed hash);
    event FeeTransferred(bytes32 indexed hash, address indexed recipient, uint amount);
    event FeeSplitTransferred(bytes32 indexed hash, address indexed recipient, uint amount);

    struct FillOrderArgs {
        Orders.Order order;
        uint amountToFill;
    }

    function fillOrder(FillOrderArgs calldata args) external returns (uint amountOut);

    function cancelOrder(bytes32 hash) external;
}
