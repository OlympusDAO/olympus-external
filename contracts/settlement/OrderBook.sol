// SPDX-License-Identifier: MIT
pragma solidity =0.8.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IERC20.sol";

import "./libraries/Orders.sol";
import "./libraries/EIP712.sol";
import "./libraries/Bytes32Pagination.sol";

contract OrderBook {

    using Orders for Orders.Order;
    using Bytes32Pagination for bytes32[];


    //////////////////////// Events ////////////////////////

    event OrderCreated( bytes32 indexed hash );


    //////////////////////// State ////////////////////////
    
    bytes32 public immutable DOMAIN_SEPARATOR;

    // Array of hashes of all orders
    bytes32[] internal _allHashes;

    // Address of order maker => hashes (orders)
    mapping(address => bytes32[]) internal _makerHashes;

    // Address of fromToken => hashes (orders)
    mapping(address => bytes32[]) internal _depositorHashes;

    // Address of toToken => hashes (orders)
    mapping(address => bytes32[]) internal _frontendOperatorHashes;

    // Hash of an order => the order and its data
    mapping(bytes32 => Orders.Order) internal _hashToOrder;


    //////////////////////// Init ////////////////////////

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("OrderBook"),
                keccak256("1"),
                chainId,
                address(this)
            )
        );
    }

    //////////////////////// Public ////////////////////////

    // Creates a limit Order for buying a bond
    function createOrder(
        Orders.Order memory order
    ) public {
        order.validate();

        bytes32 hash = order.hash();

        address signer = EIP712.recover(DOMAIN_SEPARATOR, hash, order.v, order.r, order.s);
        require(signer != address( 0 ) && signer == order.maker, "invalid-signature");

        require(_hashToOrder[ hash ].maker == address( 0 ), "order-exists");
        
        _hashToOrder[ hash ] = order;
        _allHashes.push( hash );
        _makerHashes[ order.maker ].push( hash );
        _depositorHashes[ order.depositor ].push( hash );
        _frontendOperatorHashes[ order.FEO ].push( hash );

        emit OrderCreated( hash );
    }

    //////////////////  View/Relayer Info  //////////////////

    // Returns the number of orders of a maker
    function makerHashesLength(
        address maker
    ) public view returns ( uint ) {
        return _makerHashes[maker].length;
    }

    // Return the number of orders of a depositor
    function depositorHashesLength(
        address depositor
    ) public view returns ( uint ) {
        return _depositorHashes[depositor].length;
    }

    // Return the number of orders of a frontend operator
    function frontendOperatorHasheslength(
        address feo
    ) public view returns ( uint ) {
        return _frontendOperatorHashes[ feo ].length;
    }

    // Returns the number of all orders
    function allHashesLength() public view returns ( uint ) {
        return _allHashes.length;
    }

    // Return an array of all hashes
    function allHashes(
        uint256 page, 
        uint256 limit
    ) public view returns ( bytes32[] memory ) {
        return _allHashes.paginate( page, limit );
    }

    // Returns an orders of a maker
    function getMakerHashes(
        address maker,
        uint256 page,
        uint256 limit
    ) public view returns ( bytes32[] memory ) {
        return _makerHashes[ maker ].paginate( page, limit );
    }

    // Returns an orders of a depositor
    function getDepositorHashes(
        address depositor,
        uint256 page,
        uint256 limit
    ) public view returns ( bytes32[] memory ) {
        return _depositorHashes[ depositor ].paginate( page, limit );
    }

    // Returns an orders of a frontend operator
    function getFrontendOperatorHashes(
        address frontendOperator,
        uint256 page,
        uint256 limit
    ) public view returns ( bytes32[] memory ) {
        return _frontendOperatorHashes[ frontendOperator ].paginate( page, limit );
    }

    // Returns an order struct for a given order hash
    function getOrder(
        bytes32 hash
    ) public view returns ( Orders.Order ) {
        return _hashToOrder[ hash ];
    }
}
