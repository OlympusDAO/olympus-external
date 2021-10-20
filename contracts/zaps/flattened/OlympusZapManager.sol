// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IStaking {
    function stake(uint256 _amount, address _recipient) external returns (bool);
    function unstake(uint256 _amount, bool _trigger) external;
    function claim(address _recipient) external;
}

interface IOwnable {
  function owner() external view returns (address);
  function renounceManagement() external;
  function pushManagement( address newOwner_ ) external;
  function pullManagement() external;
}

abstract contract Ownable is IOwnable {

    address internal _owner;
    address internal _newOwner;

    event OwnershipPushed(address indexed previousOwner, address indexed newOwner);
    event OwnershipPulled(address indexed previousOwner, address indexed newOwner);

    constructor () {
        _owner = msg.sender;
        emit OwnershipPushed( address(0), _owner );
    }

    function owner() public view override returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require( _owner == msg.sender, "Ownable: caller is not the owner" );
        _;
    }

    function renounceManagement() public virtual override onlyOwner() {
        emit OwnershipPushed( _owner, address(0) );
        _owner = address(0);
    }

    function pushManagement( address newOwner_ ) public virtual override onlyOwner() {
        require( newOwner_ != address(0), "Ownable: new owner is the zero address");
        emit OwnershipPushed( _owner, newOwner_ );
        _newOwner = newOwner_;
    }
    
    function pullManagement() public virtual override {
        require( msg.sender == _newOwner, "Ownable: must be new owner to pull");
        emit OwnershipPulled( _owner, _newOwner );
        _owner = _newOwner;
    }
}

interface IBondDepository {
    function deposit(uint _amount, uint _maxPrice, address _depositor) external returns ( uint );
    function payoutFor( uint _value ) external view returns ( uint );
}

contract OlympusZapManager is Ownable {


    /////////////// storage ///////////////

    address public staking = 0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a;

    address public constant OHM = 0x383518188C0C6d7730D91b2c03a03C837814a899;

    address public sOHM = 0x04F2694C8fcee23e8Fd0dfEA1d4f5Bb8c352111F;

    address public wsOHM = 0xCa76543Cf381ebBB277bE79574059e32108e3E65;

    // IE DAI => DAI bond depo
    mapping(address => address) public principalToDepository;

    ///////////// public logic ////////////

    function deposit(
        address _depositor,
        address _principal,
        uint _amount,
        uint _maxBondPrice
    ) external returns ( uint ) {
        address depository = principalToDepository[ _principal ];
        // make sure market exists for given principal/toToken
        require( principalToDepository[ _principal ] != address(0), "bonding market doesn't exist");
        // buy bond on the behalf of user
        IBondDepository( depository ).deposit( _amount, _maxBondPrice, _depositor );
        // return OHM payout for the given bond
        return IBondDepository( depository ).payoutFor( _amount );
    }

    ///////////// policy only /////////////

    function update_Staking(
        address _staking
    ) external onlyOwner {
        staking = _staking;
    }

    function update_sOHM(
        address _sOHM
    ) external onlyOwner {
       sOHM = _sOHM;
    }

    function update_wsOHM(
        address _wsOHM
    ) external onlyOwner {
        wsOHM = _wsOHM;
    }

    function update_BondDepos(
        address[] calldata principals, 
        address[] calldata depos
    ) external onlyOwner {
        require( principals.length == depos.length, "array param lengths must match");
        // update depos for each principal
        for ( uint i; i < principals.length; i++) {
            principalToDepository[ principals[ i ] ] = depos[ i ];
        }
    }
}
