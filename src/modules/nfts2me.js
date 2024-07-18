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
        },
        satoshi: {
            contractData: {
                address: "0xc0A2a606913A49a0B0a02F682C833EFF3829B4bA",
                abi: Nfts2me.STANDARD_TOKEN_ABI
            }
        },
        frogWars: {
            contractData: {
                address: "0x32DeC694570ce8EE6AcA08598DaEeA7A3e0168A3",
                abi: Nfts2me.STANDARD_TOKEN_ABI
            }
        },
        toads: {
            contractData: {
                address: "0x0841479e87Ed8cC7374d3E49fF677f0e62f91fa1",
                abi: Nfts2me.STANDARD_TOKEN_ABI
            }
        },
        townStory: {
            contractData: {
                address: "0x8Ad15e54D37d7d35fCbD62c0f9dE4420e54Df403",
                abi: Nfts2me.STANDARD_TOKEN_ABI
            }
        },
        kanVoyage: {
            contractData: {
                address: "0x3A21e152aC78f3055aA6b23693FB842dEFdE0213",
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

        const mintedAmount = await contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}