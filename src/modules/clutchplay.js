import fs from "fs";
import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class ClutchPlay {
    static CRAZY_GANG_TOKEN_ADDRESS = "0xB8DD4f5Aa8AD3fEADc50F9d670644c02a07c9374";
    static CRAZY_GANG_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/crazyGangToken.json', "utf8"));
 
    static LAUNCHPAD_INFO = {
        crazyGang: {
            contractData: {
                address: ClutchPlay.CRAZY_GANG_TOKEN_ADDRESS,
                abi: ClutchPlay.CRAZY_GANG_TOKEN_ABI
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

        const maxMintFee = BigInt(120000000000000);

        const contractData = ClutchPlay.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const value = await contract.mintFee();
        if (value > maxMintFee) {
            throw Error(`Mint fee is ${fee} but ${maxMintFee} expected`);
        }

        const ipfsLink = await this.#generateIpfsLink(nftName);

        const estimatedGasLimit = await contract.safeMint.estimateGas(
            this.signer.address,
            ipfsLink,
            { value }
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
		const tx = await contract.safeMint(
            this.signer.address,
            ipfsLink,
            { value, gasLimit }
		);

        const receipt = await tx.wait();
        return await receipt.hash;
    }

    async #generateIpfsLink(nftName) {
        return 'https://ipfs.clutchplay.ai/ipfs/QmZWS2JtreLb5QJbJ3gz3bV1zcY3V8hR7DvsKtuQe9JFQi';
    }

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = ClutchPlay.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}