import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class ACG {
    static ADDRESS = "0x057b0080120D89aE21cC622db34f2d9Ae9fF2BDE";
    static ABI = JSON.parse(fs.readFileSync('./src/abi/acgLaunchpad.json', "utf8"));
    static STANDARD_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/acgToken.json', "utf8"))

    static LAUNCHPAD_INFO = {
        tcom: {
            contractData: {
                address: "0xEf31F7A35a21c43EF4ab2e1aC3F93116d3b38346",
                abi: ACG.STANDARD_TOKEN_ABI
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

        const contract = new ethers.Contract(ACG.ADDRESS, ACG.ABI, this.signer);

        const maxMintFeeWei = BigInt(0);  // they forced me to send 0.0001 ETH via website on start lol
        const value = await contract.price();

        if (await value > maxMintFeeWei) {
            throw Error(`Mint fee is ${value} but ${maxMintFeeWei} expected`);
        }

        const estimatedGasLimit = await contract.mint.estimateGas();
        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        
        const tx = await contract.mint({ gasLimit });

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = ACG.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = await contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}