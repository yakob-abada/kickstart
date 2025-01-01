import HDWalletProvider from '@truffle/hdwallet-provider';
import {Web3} from "web3";
import compiledFactory from '../ehereum/build/FactoryCampaign.json' with { type: "json" };

const provider = new HDWalletProvider({
    mnemonic: 'board arrange own upper silly universe hub float print vapor okay this',
    providerOrUrl: 'https://sepolia.infura.io/v3/07e3619c57ae4bcebadc9929c381339c'
});

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account", accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode, arguments: [] })
        .send({ gas: "1000000", from: accounts[0] });

    console.log("Contract deployed to", result.options.address);
    provider.engine.stop();
};
deploy();