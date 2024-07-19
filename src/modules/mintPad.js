import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class MintPad {
    static STANDARD_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/mintPadToken.json', "utf8"))
    static LAUNCHPAD_INFO = {
        demmortal: {
            contractData: {
                address: "0x5A77B45B6f5309b07110fe98E25A178eEe7516c1",
                abi: MintPad.STANDARD_TOKEN_ABI,
            },
            mintArgs: {
                id: 0,
                amount: 1,
                data: '0x'
            }
        }
    }

    constructor(provider, signer, gasLimitMultipliers, proxy=null) {
        this.provider = provider
        this.signer = signer
        this.gasLimitMultipliers = gasLimitMultipliers
        this.proxy = proxy
    }

    #getGasLimitMultiplier() {
        return randFloat(this.gasLimitMultipliers[0], this.gasLimitMultipliers[1]);
    }

    async mintNft(nftName) {
        logger.debug(`Trying to mint ${nftName}`);

        const contractData = MintPad.LAUNCHPAD_INFO[nftName].contractData;
        const mintArgs = MintPad.LAUNCHPAD_INFO[nftName].mintArgs;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const estimatedGasLimit = await contract.mint.estimateGas(
            this.signer.address,
            mintArgs.id,
            mintArgs.amount,
            mintArgs.data
        );
        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        
        const tx = await contract.mint(
            this.signer.address,
            mintArgs.id,
            mintArgs.amount,
            mintArgs.data,
            { gasLimit }
        );

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = MintPad.LAUNCHPAD_INFO[nftName].contractData;
        const mintArgs = MintPad.LAUNCHPAD_INFO[nftName].mintArgs;

        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = await contract.balanceOf(this.signer.address, mintArgs.id);
        return await mintedAmount == 0 ? false : true;
    }
}