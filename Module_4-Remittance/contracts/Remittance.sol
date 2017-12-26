pragma solidity ^0.4.18;

import '../contractLibrary/contracts/SafeMath.sol';
import '../contractLibrary/contracts/contractModifiers/Killable.sol';

contract Remittance is Killable {

    using SafeMath for uint256;

    struct ChallengeStruct {
        uint    approvedAmount;
        uint    lastValidBlock;
        bool    isPaid;
    }

    uint public numBlocksUntilTimeout;

    mapping(bytes32 => ChallengeStruct) private challengeStructs;
  
    event LogDeposit(address indexed sender, uint indexed deposit, uint indexed balance);
    event LogSendRemittance(address sender, uint indexed approvedAmount, address indexed shop, address indexed recipient, uint currentBlock, uint lastValidBlock);
    event LogWithdrawRequest(address indexed sender, address indexed recipient, uint indexed requestAmount);
    
    function Remittance(uint _numBlocksUntilTimeout)
        public
    {
        require(_numBlocksUntilTimeout > 0);
        numBlocksUntilTimeout = _numBlocksUntilTimeout;
    }

    function depositFunds() 
        public
        payable
        returns(bool success)
    {
        assert(msg.value > 0);
        LogDeposit(msg.sender, msg.value, this.balance);
        return true;
    }

    function sendRemittance(uint approvedAmount, address shop, bytes32 shopPassword, address recipient, bytes32 recipientPassword)
        public
        onlyOwner
        returns(bool success)
    {
        require(approvedAmount > 0);
        require(shop != 0x0);
        require(shopPassword != 0);
        require(recipient != 0x0);
        require(recipientPassword != 0);

        bytes32 structHash = createHash(recipient, shopPassword, recipientPassword);

        ChallengeStruct memory challenge = challengeStructs[structHash];
        assert(challenge.lastValidBlock == 0); // allow password hash combination once
        challenge.approvedAmount = approvedAmount;
        challenge.lastValidBlock = block.number.add(numBlocksUntilTimeout);
        challengeStructs[structHash] = challenge;

        LogSendRemittance(msg.sender, approvedAmount, shop, recipient, block.number, challenge.lastValidBlock);
        return true;
    }

    function requestWithdraw(address recipient, bytes32 unlockHash)
        public
        returns(bool success)
    {
        require(recipient != 0x0);
        require(unlockHash != 0);

        ChallengeStruct memory challenge = challengeStructs[unlockHash];
        assert(!challenge.isPaid);
        assert(block.number <= challenge.lastValidBlock);
        assert(challenge.approvedAmount <= this.balance);
        challenge.isPaid = true;
        challengeStructs[unlockHash] = challenge;
        LogWithdrawRequest(msg.sender, recipient, challenge.approvedAmount);
        msg.sender.transfer(challenge.approvedAmount);
        return true;   
    }

    /** Pure */

    function createHash(address recipientAddress, bytes32 shopPassword, bytes32 recipientPassword)
        public
        pure
        returns(bytes32 hash)
    {    
        return keccak256(recipientAddress, shopPassword, recipientPassword);
    } 

    /** Getters */
    
    function getChallengeStruct(bytes32 unlockHash)
        public
        view
        returns(ChallengeStruct challengeStruct)
    {
        return challengeStructs[unlockHash];
    }
  
}