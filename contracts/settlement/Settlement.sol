// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IERC20.sol";
import "./interfaces/ISettlement.sol";
import "./interfaces/IBondDepository.sol";

import "./libraries/Orders.sol";
import "./libraries/EIP712.sol";

contract Settlement is ISettlement {

    using Orders for Orders.Order;

    using SafeERC20 for IERC20;

    //////////////////////// State ////////////////////////

    IBondDepository public bondDepository;

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(address => mapping(bytes32 => bool)) public canceledHashes;

    mapping(bytes32 => uint256) public amountOfHashFilled;
A

    //////////////////////// Init ////////////////////////

    constructor(
        IBondDepository depo,
        uint256 orderBookChainId,
        address orderBookAddress
    ) {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint chainId,address verifyingContract)"
                ),
                keccak256("OrderBook"),
                keccak256("1"),
                orderBookChainId,
                orderBookAddress
            )
        );
        bondDepository = depo;
    }

    //////////////////////// Relayer ////////////////////////

    // Fills an order
    function fillOrder(FillOrderArgs memory args) public override returns (uint256 amountOut) {
        // voids flashloan attack vectors
        require(msg.sender == tx.origin, "called-by-contract");

        // Check if the order is canceled / already fully filled
        bytes32 hash = args.order.hash();
        _validateStatus(args, hash);

        // Check if the signature is valid
        address signer = EIP712.recover(
            DOMAIN_SEPARATOR,
            hash,
            args.order.v,
            args.order.r,
            args.order.s
        );
        require(signer != address(0) && signer == args.order.maker, "invalid-signature");

        // Calculates amountOutMin
        uint256 amountOutMin = args.order.amount / args.order.maxBondPrice;

        // increase filled amount
        amountOfHashFilled[hash] += args.amountToFill;

        // purchase bond
        uint256 received = _deposit(args);

        // make sure bond pays out the minimum amount of OHM
        require(received >= amountOutMin, "maxBondPrice not satisfied");

        emit OrderFilled(hash, args.amountToFill, amountOut);
    }

    //////////////////////// Maker ////////////////////////

    // Cancels an order, has to been called by order maker
    function cancelOrder(bytes32 hash) public override {
        canceledHashes[msg.sender][hash] = true;
        emit OrderCanceled(hash);
    }

    //////////////////////// Internal ////////////////////////

    // Checks if an order is canceled / already fully filled
    function _validateStatus(FillOrderArgs memory args, bytes32 hash) internal {
        require(args.order.deadline >= block.timestamp, "order-expired");
        require(!canceledHashes[args.order.maker][hash], "order-canceled");
        require(
            amountOfHashFilled[hash] + args.amountToFill <= args.order.amount,
            "already-filled"
        );
    }

    // Handles depositing to depo for bond on behalf of depositor
    function _deposit(FillOrderArgs memory args) internal returns (uint256 dues) {
        // get principal from orders bond ID
        IERC20 principal = bondDepository.bonds(args.order.BID);
        // transfer makers tokens to the contract,
        // presumes maker has approved the contract
        principal.safeTransferFrom(args.order.maker, address(this), args.order.amount);
        // purchase bond for depositor
        return
            bondDepository.deposit(
                args.order.amount,
                args.order.maxBondPrice,
                args.order.depositor,
                args.order.BID,
                args.order.FEO
            );
    }
}
