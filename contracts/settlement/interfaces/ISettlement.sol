// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "../libraries/Orders.sol";

interface ISettlement {
    event OrderFilled(bytes32 indexed hash, uint256 amount, uint256 amountOut);
    event OrderCanceled(bytes32 indexed hash);
    event FeeTransferred(bytes32 indexed hash, address indexed recipient, uint256 amount);
    event FeeSplitTransferred(bytes32 indexed hash, address indexed recipient, uint256 amount);

    struct FillOrderArgs {
        Orders.Order order;
        uint256 amountToFill;
        uint256 minToToken;
        address swapTarget;
        bytes swapData;
        address affiliate;
    }

    function fillOrder(FillOrderArgs calldata args) external returns (uint256 amountOut);

    function cancelOrder(bytes32 hash) external;
}
