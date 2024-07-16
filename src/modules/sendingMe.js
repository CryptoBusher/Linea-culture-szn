import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class SendingMe {
    static STANDARD_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/sendingMeToken.json', "utf8"))
    static LAUNCHPAD_INFO = {
        samuel: {
            contractData: {
                address: "0xEaea2Fa0dea2D1191a584CFBB227220822E29086",
                abi: SendingMe.STANDARD_TOKEN_ABI
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

        const contractData = SendingMe.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const estimatedGasLimit = await contract.mint.estimateGas();
        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        
        const tx = await contract.mint({ gasLimit });

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = SendingMe.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = await contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}