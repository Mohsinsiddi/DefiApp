const { should, assert } = require('chai')


const TokenFarm = artifacts.require('TokenFarm')
const DappToken=artifacts.require('DappToken')
const DaiToken=artifacts.require('DaiToken')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function token(n){
    return web3.utils.toWei(n,'Ether')
}    
contract('TokenFarm',([owner,investor])=>{
    let daiToken,dappToken,tokenFarm
    before(async()=>{
        //load contracts
        daiToken= await DaiToken.new()
        dappToken=await DappToken.new()
        tokenFarm= await TokenFarm.new(dappToken.address,daiToken.address)
         
        //transfer all dapp tokens to tokenfarm contract address
        await dappToken.transfer(tokenFarm.address,token('1000000'))
         //send tokens to investor
        await daiToken.transfer(investor,token('100'),{from:owner})
    })

    describe('Dai token Deployment',async()=>{
        it('has name',async()=>{
            const name= await daiToken.name();
            assert.equal(name,'Mock DAI Token')
        })
    })
    describe('Dapp token Deployment',async()=>{
        it('has name',async()=>{
            const name= await dappToken.name();
            assert.equal(name,'DApp Token')
        })
    })
    describe('TokenFarm contract Deployment',async()=>{
        it('has name',async()=>{
            const name= await tokenFarm.name();
            assert.equal(name,'Dapp Token Farm')
        })
        it('Tokenfarm contract has all tokens',async()=>{
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(),token('1000000'))
        })
    })
    describe('Farming(Staking) Tokens',async()=>{
        it('Rewards for investor for staking DAI tokens in TokenFarm',async()=>{
            let result
            //check investors balance before staking
            result = await daiToken.balanceOf(investor) 
            assert.equal(result.toString(),token('100'),'Investor Dai balance should be correct')
            //Stake dai tokens
            await daiToken.approve(tokenFarm.address,token('100'),{from:investor})
            await tokenFarm.stakeTokens(token('100'),{from:investor})
            //balance after update of investor
            result = await daiToken.balanceOf(investor) 
            assert.equal(result.toString(),token('0'),'Investor Dai balance should be correct after staking')
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),token('100'),'TokenFarm Contract balance should be correct after staking')
           //invested balance in contract 
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),token('100'),'Investor balance should be correct')
            //staking status
            result=await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true','Investor staking status should be correct')
            //issuing tokens
            await tokenFarm.issueTokens({from:owner})
            //checking the balance after issuing tokens
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(),token('100'),'Investor dapp token wallet should be correct after issuing')
            //ensure that only owner can issue tokens
            await tokenFarm.issueTokens({from:investor}).should.be.rejected;
            
            //unstake the tokens
            await tokenFarm.unStakeTokens({from:investor});
            //check results after staking and all
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),token('100'),'Investor Dai token wallet must be correct')
             //tokenfarm balance after unstaking
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),token('0'),'Token farm Dai token balance should be correct')
             //invested balance after unstaking
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),token('0'),'UnStaking balance of investor should be correct')
            //staking status after unstaking
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'false','Unstaking status should be correct')
        })
    })
})    