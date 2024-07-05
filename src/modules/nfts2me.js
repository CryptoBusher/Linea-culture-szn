import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class Nfts2me {
    static STANDARD_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/nfts2MeToken.json', "utf8"))
    static LAUNCHPAD_INFO = {
        wizards: {
            contractData: {
                address: "0xD540038B0B427238984E0341bA49F69CD80DC139",
                abi: Nfts2me.STANDARD_TOKEN_ABI
            }
        },
        eFrogs: {
            contractData: {
                address: "0xf4AA97cDE2686Bc5ae2Ee934a8E5330B8B13Be64",
                abi: Nfts2me.STANDARD_TOKEN_ABI
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

        const contractData = Nfts2me.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const estimatedGasLimit = await contract.mintEfficientN2M_001Z5BWH.estimateGas();
        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        
        const tx = await contract.mintEfficientN2M_001Z5BWH({ gasLimit });

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = Nfts2me.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}