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
    event LogWithdrawRequest(address indexed requestor, uint indexed requestAmount);
    
    function Remittance(uint _numBlocksUntilTimeout)
        public
    {
        require(_numBlocksUntilTimeout > 0);
        numBlocksUntilTimeout = _numBlocksUntilTimeout;
    }

    function sendRemittance(uint approvedAmount, address shop, address recipient, bytes32 suppliedHash)
        public
        onlyOwner
        payable
        returns(bool success)
    {
        require(msg.value > 0);
        // gas-punish: if(msg.value == 0) { assembly { invalid } }
        require(approvedAmount > 0);
        require(shop != 0x0);
        require(recipient != 0x0);
        require(suppliedHash != 0x0);
        
        LogDeposit(msg.sender, msg.value, this.balance);

        ChallengeStruct storage challenge = challengeStructs[suppliedHash];
        require(challenge.lastValidBlock == 0); // allow password hash combination once
        challenge.approvedAmount = approvedAmount;
        challenge.lastValidBlock = block.number.add(numBlocksUntilTimeout);

        LogSendRemittance(msg.sender, approvedAmount, shop, recipient, block.number, challenge.lastValidBlock);
        return true;
    }

    function requestWithdraw(address recipientAddress, bytes32 shopPassword, bytes32 recipientPassword)
        public
        returns(bool success)
    {
        require(recipientAddress != 0x0);
        require(shopPassword != 0);
        require(recipientPassword != 0);

        bytes32 unlockHash = createHash(recipientAddress, shopPassword, recipientPassword);
        ChallengeStruct storage challenge = challengeStructs[unlockHash];
        require(!challenge.isPaid);
        require(block.number <= challenge.lastValidBlock);
        assert(challenge.approvedAmount <= this.balance);
        challenge.isPaid = true;
        LogWithdrawRequest(msg.sender, challenge.approvedAmount);
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