// SPDX-License-Identifier: WTFPL
pragma solidity ^0.8.0;

interface IStaking {
    function stake(uint256 _amount, address _recipient) external returns (bool);
    function unstake(uint256 _amount, bool _trigger) external;
    function claim(address _recipient) external;
}

interface IOlympusZap {
    function update_Staking(IStaking _staking) external;
    function update_sOHM(address _sOHM) external;
    function update_wsOHM(address _wsOHM) external;
    function update_BondDepository(address principal, address depository) external;
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

contract OlympusZapManager is Ownable {

    IOlympusZap public OlympusZap;

    constructor( IOlympusZap _olympusZap ) {
        OlympusZap = _olympusZap;
    }

    function update_Staking(
        IStaking _staking
    ) external onlyOwner {
        OlympusZap.update_Staking( _staking );
    }

    function update_sOHM(
        address _sOHM
    ) external onlyOwner {
        OlympusZap.update_sOHM( _sOHM );
    }

    function update_wsOHM(
        address _wsOHM
    ) external onlyOwner {
        OlympusZap.update_wsOHM( _wsOHM );
    }

    function update_BondDepository(
        address principal, 
        address depository
    ) external onlyOwner {
        OlympusZap.update_BondDepository( principal, depository );
    }
}