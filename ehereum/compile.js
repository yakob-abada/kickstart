import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import solc from 'solc'

const __dirname = path.resolve();
const buildPath = path.resolve(__dirname, 'build');
await fse.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8')
const output = solc.compile(source, 1).contracts;

fse.ensureDirSync(buildPath);

for (let contract in output) {
    fse.writeJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}