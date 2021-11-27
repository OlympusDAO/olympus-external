// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;

import "./interfaces/IERC20.sol";
import "./interfaces/ISettlement.sol";
import "./interfaces/IBondDepository.sol";
import "./interfaces/IOlympusZap_V1.sol";

import "./libraries/SafeERC20.sol";
import "./libraries/Orders.sol";
import "./libraries/EIP712.sol";

contract Settlement is ISettlement {
    using Orders for Orders.Order;

    using SafeERC20 for IERC20;

    //////////////////////// State ////////////////////////

    address public OlympusDAO;

    address public pendingOlympusDAO;

    IOlympusZap_V1 public zap;

    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(bytes32 => uint256) public amountOfHashFilled;

    mapping(address => mapping(bytes32 => bool)) public canceledHashes;

    mapping(address => mapping(address => IBondDepository)) public principalAndPayoutTokenToDepo;

    //////////////////////// Modifers ////////////////////////

    modifier onlyOlympusDAO() {
        require(msg.sender == OlympusDAO, "UNAUTHORIZED");
        _;
    }

    //////////////////////// Init ////////////////////////

    constructor(uint256 orderBookChainId, address orderBookAddress) {
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

        OlympusDAO = msg.sender;
    }

    //////////////////////// Relayer ////////////////////////

    // Fills an order
    function fillOrder(FillOrderArgs memory args) public override returns (uint256 amountOut) {
        // voids flashloan attack vectors
        require(msg.sender == tx.origin, "called-by-contract");

        // Check if the order is canceled / already fully filled
        bytes32 hash = args.order.hash();

        // validate status
        require(args.order.deadline >= block.timestamp, "order-expired");
        require(!canceledHashes[args.order.maker][hash], "order-canceled");
        require(
            amountOfHashFilled[hash] + args.amountToFill <= args.order.amount,
            "already-filled"
        );

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

    // Handles depositing to depo for bond on behalf of depositor
    function _deposit(FillOrderArgs memory args) internal returns (uint256 dues) {
        // interface depo
        IBondDepository bondDepository = principalAndPayoutTokenToDepo[args.order.principal][
            args.order.payoutToken
        ];

        if (args.order.zap) {
            // transfer makers tokens to the contract,
            // presumes maker has approved the contract
            IERC20(args.order.zapInputToken).safeTransferFrom(
                args.order.maker,
                address(this),
                args.order.amount
            );

            zap.ZapIn(
                args.order.zapInputToken,
                args.order.amount,
                args.order.principal,
                args.minToToken,
                args.swapTarget,
                args.swapData,
                args.affiliate,
                args.order.payoutToken,
                args.order.maxBondPrice,
                false
            );
        } else {
            // transfer makers tokens to the contract,
            // presumes maker has approved the contract
            IERC20(args.order.principal).safeTransferFrom(
                args.order.maker,
                address(this),
                args.order.amount
            );
        }

        // MAKE SURE BOND DEPO IS APPROVED TO SPEND THIS CONTRACTS TOKENS

        // purchase bond for depositor
        dues = bondDepository.deposit(
            args.order.amount,
            args.order.maxBondPrice,
            args.order.depositor
        );
    }

    function setUpBondDepo(
        address principal,
        address payoutToken,
        IBondDepository depo
    ) external onlyOlympusDAO {
        principalAndPayoutTokenToDepo[principal][payoutToken] = depo;

        IERC20 _principal = IERC20(principal);

        // check if tokens already approved, if not max approve
        if (_principal.allowance(address(this), address(depo)) >= 0) {
            _principal.approve(address(depo), type(uint256).max);
        }
    }

    function pushOlympusDAO(address to, bool effectiveImmedietely) external onlyOlympusDAO {
        if (effectiveImmedietely) OlympusDAO = to;
        pendingOlympusDAO = to;
    }

    function pullOlympusDAO() external {
        require(msg.sender == pendingOlympusDAO);
        OlympusDAO = pendingOlympusDAO;
    }
}
