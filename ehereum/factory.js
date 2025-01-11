import web3 from './web3'
import compiledFactory from '../ehereum/build/FactoryCampaign.json' with { type: "json" };

const address = '0xa6eC27F1E39312a8BcCeC6053DBb5de7c344DEA3';

export default new web3.eth.Contract(compiledFactory.abi, address)