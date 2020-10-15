pragma solidity ^0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract Tokenfarm{
    string public name="Dapp Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address[] public stakers;
    address public owner;
    mapping(address=>uint) public stakingBalance;
    mapping(address=>bool) public hasStaked;
    mapping(address=>bool) public isStaking;
    constructor(DappToken _dappToken,DaiToken _daiToken) public {
            dappToken=_dappToken;
            daiToken= _daiToken;
            owner=msg.sender;
    }
    //1.Stacking Tokens(Deposit)
    function stakeTokens(uint _amount) public {
        require(_amount>0,'Amount cannot be Zero');
         //Transfer Dai token from investor to TokenFarm contract
         daiToken.transferFrom(msg.sender,address(this),_amount);
         //updating stakes
         stakingBalance[msg.sender]=stakingBalance[msg.sender] + _amount;
         //add users to stakers array if and only if they havent staked already
         if(!hasStaked[msg.sender]){
             stakers.push(msg.sender);
         }
         //staking status
         isStaking[msg.sender]=true;
         hasStaked[msg.sender]=true;
    }
    //2.Issuing Tokens(Earning Interest)
    function issueTokens() public {
        require(msg.sender==owner,'The caller of this function must be Owner');
        for(uint i=0;i<stakers.length;i++){
            address recipient=stakers[i];
            uint balance=stakingBalance[recipient];
            if(balance>0){
                dappToken.transfer(recipient,balance);
            }
        }
    }
    //3.Unstaking Tokens(Widhrawal)
    function unStakeTokens() public {
        //fetching balance
        uint balance = stakingBalance[msg.sender];
        require(balance>0,'Staking Balance cannot be Zero');
         //transfer to the investor from contract
        daiToken.transfer(msg.sender,balance);
         //reset staking balance
        stakingBalance[msg.sender]=0;
        //reset staking status
        isStaking[msg.sender]=false;


    }


}
    