pragma solidity ^0.4.18;

import '../contractLibrary/SafeMath.sol';
import '../contractLibrary/contractModifiers/Killable.sol';

contract Remittance is Killable {

  using SafeMath for uint256;
  
  struct challengeStruct {
      bytes32 challengeFactor1;
      bytes32 challengeFactor2;
      bool exists;
  }

  mapping(address => challengeStruct) public challengeStructs;

  uint private challengeMaxTimeout;

  event LogInstantiateContract(address sender, uint currentBlockNumber, uint numBlocksUntilTimeout);
  event LogPaymentRequest(address sender, bytes32 challengeFactor1, bytes32 challengeFactor2, uint requestAmount);

  function Remittance(uint numBlocksUntilTimeout)
    public
  {
      // TODO: still need to figure out where and how to add the timeout
      require(numBlocksUntilTimeout > 0);
      challengeMaxTimeout = block.number.add(numBlocksUntilTimeout);
      LogInstantiateContract(msg.sender, block.number, numBlocksUntilTimeout);
  }
  
  /**
   * paymentRequestor - address of the exchange shop requesting funds
   * challengeFactor1 - pre-shared keccak256 hash with exchange shop
   * challengeFactor2 - pre-shared keccak256 hash with funds recipient
   */
  
  function setRequestorChallengeFactors(address exchangeShop, bytes32 challengeFactor1, bytes32 challengeFactor2)
    onlyOwner
    public
    returns(bool isSet)
  {
      require(!isExchangeShop(exchangeShop));
      challengeStructs[exchangeShop].challengeFactor1 = challengeFactor1;
      challengeStructs[exchangeShop].challengeFactor2 = challengeFactor2;
      challengeStructs[exchangeShop].exists = true;
      return true;
  }
  
  function paymentRequest(bytes32 challengeFactor1, bytes32 challengeFactor2, uint requestAmount)
    public
    returns(bool success)
  {
      require(isExchangeShop(msg.sender));
      require(requestAmount > 0);
      require(requestAmount < getOwner().balance);
      require(keccak256(challengeFactor1, challengeFactor2) == keccak256(challengeStructs[msg.sender].challengeFactor1, challengeStructs[msg.sender].challengeFactor2));
      LogPaymentRequest(msg.sender, challengeFactor1, challengeFactor2, requestAmount);
      msg.sender.transfer(requestAmount);
      return true;
  }
  
  function isExchangeShop(address shopAddress) 
    public 
    constant 
    returns(bool isIndeed)
  {
    return challengeStructs[shopAddress].exists;
  }
  
}