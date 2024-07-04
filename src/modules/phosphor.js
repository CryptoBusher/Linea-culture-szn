import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class Phosphor {
    static LAUNCHPAD_INFO = {
        push: {
            contractData: {
                address: "0x3685102bc3D0dd23A88eF8fc084a8235bE929f1c";
                abi: JSON.parse(fs.readFileSync('./src/abi/pushToken.json', "utf8"));
            },
            mintArgs: {
                _tokenId: 0,
                _quantity: 1,
                _currency: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                _pricePerToken: 0,
                _allowlistProof: {
                    proof: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    quantityLimitPerWallet: 2,
                    pricePerToken: 0,
                    currency: '	0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                },
                _data: '0x'
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

        const contractData = Phosphor.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const estimatedGasLimit = await contract.claim.estimateGas(
            this.signer.address,
            contractData.mintArgs._tokenId,
            contractData.mintArgs._quantity,
            contractData.mintArgs._currency,
            contractData.mintArgs._pricePerToken,
            contractData.mintArgs._allowlistProof,
            contractData.mintArgs._data
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
		const tx = await contract.safeMint(
            this.signer.address,
            contractData.mintArgs._tokenId,
            contractData.mintArgs._quantity,
            contractData.mintArgs._currency,
            contractData.mintArgs._pricePerToken,
            contractData.mintArgs._allowlistProof,
            contractData.mintArgs._data,
            { gasLimit }
		);

        const receipt = await tx.wait();
        return await receipt.hash;
    }

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = Phosphor.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = contract.balanceOf(this.signer.address, contractData.mintArgs._tokenId);
        return await mintedAmount == 0 ? false : true;
    }
}