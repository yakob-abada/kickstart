import web3 from "./web3";
import compiledCampaign from "./build/Campaign.json";

export default async address => await new web3.eth.Contract(compiledCampaign.abi, address);