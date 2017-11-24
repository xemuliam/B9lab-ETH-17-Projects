pragma solidity ^0.4.18;

import '../contractLibrary/contractModifiers/Pausable.sol';
import '../contracts/RockPaperScissors.sol';

contract Hub is Pausable {
  
  address[] public campaigns;

  event LogNewCampaign(address campaign, address sponsor, uint depositAmount);

  function newCampaign(uint depositAmount)
    public
    returns(address contractAddress)
  {
    RockPaperScissors trustedCampaign = new RockPaperScissors(msg.sender, depositAmount);
    campaigns.push(trustedCampaign);
    LogNewCampaign(trustedCampaign, msg.sender, depositAmount);
    return trustedCampaign;
  }

  function getCampaignCount()
    public
    constant
    returns(uint campaignCount)
  {
    return campaigns.length;
  }

}
