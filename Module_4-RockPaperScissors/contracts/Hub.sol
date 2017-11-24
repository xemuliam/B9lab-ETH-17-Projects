pragma solidity ^0.4.18;

import '../contractLibrary/contractModifiers/Pausable.sol';
import '../contracts/RockPaperScissors.sol';

contract Hub is Pausable {
  
  address[] public campaigns;

  function newCampaign(uint depositAmount)
    public
    returns(address contractAddress)
  {
    RockPaperScissors trustedCampaign = new RockPaperScissors(depositAmount);
    campaigns.push(trustedCampaign);
    return trustedCampaign;
  }

}
