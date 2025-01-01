import assert from 'assert'
import {Web3} from "web3";
import ganache from "ganache"

import compiledFactory from '../ehereum/build/FactoryCampaign.json' with { type: "json" };
import compiledCampaign from '../ehereum/build/Campaign.json' with { type: "json" };
const web3 = new Web3(ganache.provider());

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({data: compiledFactory.bytecode, arguments: []})
        .send({from: accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({from: accounts[0], gas: '1000000'});

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaign', () => {
    it('Should be deployed', async () => {
        assert.ok(factory.options.address)
    });

    it('Should has min contribution', async () => {
        const minContribution = await campaign.methods.minContribution().call();
        assert.equal(minContribution, 100);
    });

    it('should has a manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('Failed contribute as its less the min', async () => {
        try {
            await campaign.methods.contribute().send({from: accounts[1], gas: '1000000'});
        } catch (error) {
            assert(error)
        }
    });

    it('Should contribute', async () => {
        await campaign.methods.contribute().send({from: accounts[1], gas: '1000000', value: '101'});
        assert.equal(await campaign.methods.approvers(accounts[1]).call(), true);
    });

    it('Should create a request', async () => {
        await campaign.methods.createRequest('buy battery', '100', accounts[1])
            .send({from: accounts[0], gas: '1000000'});
        const request = await campaign.methods.requests(0).call();
        assert.equal(request.description, 'buy battery');
        assert.equal(request.value, '100');
        assert.equal(request.recipient, accounts[1]);
        assert.equal(request.approvalCount, 0);
    });

    it('should vote', async () => {
        await campaign.methods.createRequest('buy battery', '100', accounts[1])
            .send({from: accounts[0], gas: '1000000'});

        await campaign.methods.contribute().send({from: accounts[1], gas: '1000000', value: '101'});

        await campaign.methods.vote(0, true).send({from: accounts[1], gas: '1000000'});
        const request = await campaign.methods.requests(0).call();
        assert.equal(request.approvalCount, 1);
    });

    it('Should complete request', async () => {
        await campaign.methods.createRequest('buy battery', '100', accounts[2])
            .send({from: accounts[0], gas: '1000000'});
        const oldBalance = await web3.eth.getBalance(accounts[2]);

        await campaign.methods.contribute().send({from: accounts[1], gas: '1000000', value: '101'});

        await campaign.methods.vote(0, true).send({from: accounts[1], gas: '1000000'});
        await campaign.methods.finalizeRequest(0).send({from: accounts[0], gas: '1000000'});
        const request = await campaign.methods.requests(0).call();
        const newBalance = await web3.eth.getBalance(accounts[2]);

        assert.equal(await campaign.methods.approverCount().call(), 1)
        assert.equal(request.approvalCount, 1);
        assert.equal(request.complete, true);
        assert.equal(newBalance, oldBalance + BigInt(100));
    })
})