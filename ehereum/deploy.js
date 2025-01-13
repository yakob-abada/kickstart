import HDWalletProvider from '@truffle/hdwallet-provider';
import {Web3} from "web3";
import compiledFactory from '../ehereum/build/FactoryCampaign.json' with { type: "json" };
import {configDotenv} from "dotenv";
configDotenv();

const provider = new HDWalletProvider({
    mnemonic: process.env.MNEMONIC,
    providerOrUrl: process.env.PROVIDER_OR_URL,
});

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account", accounts[0]);

    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ gas: "1400000", from: accounts[0] });

    console.log("Contract deployed to", result.options.address);
    provider.engine.stop();
};
deploy();