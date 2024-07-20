import fs from "fs";

import { ethers } from "ethers";

import { logger } from "../logger/logger.js";
import { randFloat } from "../utils/helpers.js";


export class ElementLaunchpad {
    static ADDRESS = "0xBcFa22a36E555c507092FF16c1af4cB74B8514C8";
    static ABI = JSON.parse(fs.readFileSync('./src/abi/elementLaunchpad.json', "utf8"));
    static LAUNCHPAD_INFO = {
        massiveOne: {
            mintArgs: {
                undefArg: '0x0c21cfbb',
                launchpadId: '0x53b93973',
                slotId: 0,
                additional: [],
                data: '0x'
            }
        },
        linusEggs: {
            mintArgs: {
                undefArg: '0x0c21cfbb',
                launchpadId: '0x1ffca9db',
                slotId: 0,
                additional: [],
                data: '0x'
            }
        },
        ascendTheEnd: {
            mintArgs: {
                undefArg: '0x0c21cfbb',
                launchpadId: '0x19a747c1',
                slotId: 0,
                additional: [],
                data: '0x'
            }
        },
        foxy: {
            mintArgs: {
                undefArg: '0x0c21cfbb',
                launchpadId: '0x2968bd75',
                slotId: 0,
                additional: [],
                data: '0x'
            }
        }
    }

    constructor(provider, signer, gasLimitMultipliers, proxy=null) {
        this.provider = provider
        this.signer = signer
        this.gasLimitMultipliers = gasLimitMultipliers
        this.proxy = proxy

        this.contract = new ethers.Contract(ElementLaunchpad.ADDRESS, ElementLaunchpad.ABI, this.signer);
    }

    #getGasLimitMultiplier() {
		return randFloat(this.gasLimitMultipliers[0], this.gasLimitMultipliers[1]);
	}

    async mintNft(nftName) {
        logger.debug(`Trying to mint ${nftName}`);

        const args = ElementLaunchpad.LAUNCHPAD_INFO[nftName].mintArgs;

        const estimatedGasLimit = await this.contract.launchpadBuy.estimateGas(
			args.undefArg,
            args.launchpadId,
            args.slotId,
            1,
			args.additional,
            args.data,
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
		const tx = await this.contract.launchpadBuy(
			args.undefArg,
            args.launchpadId,
            args.slotId,
            1,
			args.additional,
            args.data,
			{ gasLimit }
		);

        const receipt = await tx.wait();
        return await receipt.hash;
    }

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const args = ElementLaunchpad.LAUNCHPAD_INFO[nftName].mintArgs;

        const mintedAmount = await this.contract.getAlreadyBuyBty(
            this.signer.address,
            args.launchpadId,
            args.slotId
        );

        return await mintedAmount == 0 ? false : true;
    }
}