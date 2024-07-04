import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class Phosphor {
    static LAUNCHPAD_INFO = {
        push: {
            contractData: {
                address: "0x3685102bc3D0dd23A88eF8fc084a8235bE929f1c",
                abi: JSON.parse(fs.readFileSync('./src/abi/pushToken.json', "utf8"))
            },
            mintArgs: {
                _tokenId: 0,
                _quantity: 1,
                _currency: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
                _pricePerToken: 0,
                _allowlistProof: [
                    ['0x0000000000000000000000000000000000000000000000000000000000000000'],
                    2,
                    0,
                    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
                ],
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

        const maxMintFeeWei = BigInt(10000000000000);
        const value = await contract.getTransactionFee();
        if (value > maxMintFeeWei) {
            throw Error(`Mint fee is ${fee} but ${maxMintFeeWei} expected`);
        }

        const mintArgs = Phosphor.LAUNCHPAD_INFO[nftName].mintArgs;
        const estimatedGasLimit = await contract.claim.estimateGas(
            this.signer.address,
            mintArgs._tokenId,
            mintArgs._quantity,
            mintArgs._currency,
            mintArgs._pricePerToken,
            mintArgs._allowlistProof,
            mintArgs._data,
            { value }
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        const tx = await contract.claim(
            this.signer.address,
            mintArgs._tokenId,
            mintArgs._quantity,
            mintArgs._currency,
            mintArgs._pricePerToken,
            mintArgs._allowlistProof,
            mintArgs._data,
            { gasLimit, value }
        );

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = Phosphor.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = contract.balanceOf(this.signer.address, Phosphor.LAUNCHPAD_INFO[nftName].mintArgs._tokenId);
        return await mintedAmount == 0 ? false : true;
    }
}