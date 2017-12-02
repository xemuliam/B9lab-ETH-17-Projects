pragma solidity ^0.4.18;

import '../contractLibrary/contracts/SafeMath.sol';
import '../contractLibrary/contracts/contractModifiers/Killable.sol';

contract Remittance is Killable {

    using SafeMath for uint256;
  
    struct ChallengeStruct {
        uint    approvedAmount;
        bytes32 challengeFactor1;
        bytes32 challengeFactor2;
        uint    lastValidBlock;
        bool    isPaid;
    }

    // shop address -> recipient address -> struct
    mapping(address => mapping(address => ChallengeStruct)) private challengeStructs;

    uint public challengeMaxTimeout;

    event LogCreateRemittance(address sender, uint approvedAmount, address shop, address recipient, uint currentBlock, uint lastValidBlock);
    event LogPaymentRequest(address sender, address recipient, uint requestAmount);

    function Remittance(uint numBlocksUntilTimeout)
        public
    {
        require(numBlocksUntilTimeout > 0);
        challengeMaxTimeout = numBlocksUntilTimeout;
    }
    
    function depositFunds() 
        public
        onlyOwner
        payable
        returns(bool success)
    {
        require(msg.value > 0);
        return true;
    }
  
    function createRemittance(uint approvedAmount, address shop, bytes32 password1, address recipient, bytes32 password2)
        public
        onlyOwner
        returns(bool success)
    {
        require(approvedAmount > 0);
        require(shop != 0);
        require(password1 != 0);
        require(recipient != 0);
        require(password2 != 0);
        ChallengeStruct storage challenge = challengeStructs[shop][recipient];
        challenge.approvedAmount = approvedAmount;
        challenge.challengeFactor1 = keccak256(password1);
        challenge.challengeFactor2 = keccak256(password2);
        challenge.lastValidBlock = block.number.add(challengeMaxTimeout);
        LogCreateRemittance(msg.sender, approvedAmount, shop, recipient, block.number, challenge.lastValidBlock);
        return true;
    }
    
    function sendRemittance(address recipient, bytes32 shopPasswordHash, bytes32 recipientPasswordHash, uint requestAmount)
        public
        returns(bool success)
    {
        ChallengeStruct storage challenge = challengeStructs[msg.sender][recipient];
        require(!challenge.isPaid);
        require(shopPasswordHash == challenge.challengeFactor1);
        require(recipientPasswordHash == challenge.challengeFactor2);
        require(requestAmount == challenge.approvedAmount);
        require(block.number <= challenge.lastValidBlock);
        challenge.isPaid = true;
        LogPaymentRequest(msg.sender, recipient, requestAmount);
        msg.sender.transfer(requestAmount);
        return true;   
    }
    
    /** Getters */
    
    function getChallengeStruct(address shop, address recipient)
        public
        view
        returns(ChallengeStruct challengeStruct)
    {
        return challengeStructs[shop][recipient];
    }
  
}
