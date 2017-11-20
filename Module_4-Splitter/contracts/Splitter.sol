pragma solidity ^0.4.18;

import '../contractLibrary/contractModifiers/Pausable.sol';

contract Splitter is Pausable {

  struct RecipientStruct {
    uint balance;
    bool exists;
  }  

  address[] private recipients;
  mapping(address => RecipientStruct) public recipientStructs;

  event LogRegistration(address sender, address owner, address recipient, uint balance);
  event LogDeposit(address sender, address owner, uint deposit, address recipient, uint share);
  event LogWithdraw(address sender, uint amount);

  function registerRecipient(address recipient)
    public
    onlyOwner
    isActive
    returns(bool success)
  {
    require(!isRecipient(recipient));

    recipients.push(recipient);
    recipientStructs[recipient].exists = true;
    LogRegistration(msg.sender, getOwner(), recipient, recipientStructs[recipient].balance);

    return true;
  }

  function deposit()
    public
    payable
    onlyOwner
    isActive
    returns(bool success)
  {
    require(msg.value != 0);
    require(recipients.length > 0);

    uint recipientCount = recipients.length;
    require(msg.value % recipientCount == 0);
    uint depositShare = msg.value / recipientCount;

    /** unavoidable unbounded loop */
    for(uint i=0; i<recipients.length; i++) {
      recipientStructs[recipients[i]].balance += depositShare;
      LogDeposit(msg.sender, getOwner(), msg.value, recipients[i], depositShare);
    }

    return true;
  }

  function withdraw() 
    public
    isActive
    returns(bool success)
  {
    uint payment = recipientStructs[msg.sender].balance;
    require(payment > 0);

    recipientStructs[msg.sender].balance = 0;
    LogWithdraw(msg.sender, payment);

    msg.sender.transfer(payment);

    if(!msg.sender.send(payment)) {
      revert();
    }

    return true;
  }

  function isRecipient(address recipient) 
    public 
    constant 
    returns(bool isIndeed)
  {
    return recipientStructs[recipient].exists;
  }

  function getAddressCount() 
    public
    constant 
    returns(uint count) 
  { 
    return recipients.length; 
  }

}
