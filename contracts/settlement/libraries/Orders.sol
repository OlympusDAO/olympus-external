// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

library Orders {
    // TODO convert to hash
    bytes32 public constant ORDER_TYPEHASH =
        keccak256(
            "Order(address maker,address depositor,uint256 amount,uint256 maxBondPrice,uint256 BID,address FEO,uint256 deadline)"
        );

    struct Order {
        address maker; // msg.sender, creator of order.
        address depositor; // account that receives the bond.
        uint256 amount; // amount of principal being used to purchase bond.
        uint256 maxBondPrice; // max price user's willing to pay denominated in principal.
        uint256 BID; // bond's unique identifier
        address FEO; // frontend operator
        uint256 deadline; // time when order can't be filled after.
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    function hash(Order memory order) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    ORDER_TYPEHASH,
                    order.maker,
                    order.depositor,
                    order.amount,
                    order.maxBondPrice,
                    order.BID,
                    order.FEO,
                    order.deadline
                )
            );
    }

    // TODO add olympus related require statements
    function validate(Order memory order) internal pure {
        require(order.maker != address(0), "invalid-maker");
        require(order.depositor != address(0), "invalid-from-token");
        // require(order.principal != address( 0 ), "invalid-to-token");
        require(order.maxBondPrice > 0, "invalid-amount-in");
        require(order.deadline > 0, "invalid-deadline");
    }
}
