pragma solidity ^0.4.18;

import '../contractLibrary/contractModifiers/Ownable.sol';
import '../contractLibrary/contractModifiers/Pausable.sol';

contract Splitter is Ownable, Pausable {

  address[] public recipients;
  mapping(address => uint) public balances;

  event LogRecipientExists(address recipient);
  event LogRegistration(address owner, address recipient, uint balance);
  event LogDeposit(address owner, uint deposit, address recipient, uint share);

  function registerRecipient(address recipient)
    public
    onlyOwner
    isActive
    returns(bool success)
  {
    bool exists;
    for(uint i=0; i<recipients.length; i++) {
      if(recipients[i] == recipient) {
        LogRecipientExists(recipient);
        exists = true;
      }
    }
    require(!exists);

    recipients.push(recipient);
    balances[recipient] = 0;
    LogRegistration(msg.sender, recipient, balances[recipient]);

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

    for(uint i=0; i<recipients.length; i++) {
      balances[recipients[i]] += depositShare;
      LogDeposit(msg.sender, msg.value, recipients[i], depositShare);
    }

    return true;
  }

  function withdraw() 
    public
    isActive
    returns(bool success)
  {
    uint payment = balances[msg.sender];

    require(payment > 0);
    require(this.balance >= payment);

    balances[msg.sender] = 0;

    if(!msg.sender.send(payment)) {
      revert();
    }

    return true;
  }

}
