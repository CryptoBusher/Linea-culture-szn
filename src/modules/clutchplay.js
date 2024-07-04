import fs from "fs";

import fetch from "node-fetch";
import { ethers } from "ethers";
import { HttpsProxyAgent } from "https-proxy-agent";

import { logger } from "../logger/logger.js";
import { randFloat, randInt, txtToArray, randomChoice } from "../utils/helpers.js";


export class ClutchPlay {
    static CRAZY_GANG_TOKEN_ADDRESS = "0xB8DD4f5Aa8AD3fEADc50F9d670644c02a07c9374";
    static CRAZY_GANG_TOKEN_ABI = JSON.parse(fs.readFileSync('./src/abi/crazyGangToken.json', "utf8"));
 
    static LAUNCHPAD_INFO = {
        crazyGang: {
            contractData: {
                address: ClutchPlay.CRAZY_GANG_TOKEN_ADDRESS,
                abi: ClutchPlay.CRAZY_GANG_TOKEN_ABI
            },
            ipfsData: {
                campaign_id: "667676dae890dc210aec58a4",
                model_id: "6676e090306348cf33987ef7",
                variations: 1
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

        const ipfsLink = this.#generateRandomIPFSLink(nftName);

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

    #generateRandomIPFSLink() {
        // dummy method as website is down
        const baseURL = 'https://ipfs.clutchplay.ai/ipfs/';
        const prefix = 'Qm';
        const length = 44;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        const randomHash = prefix + Array.from({ length }, () => randomChoice(characters)).join('');
        return baseURL + randomHash;
    }

    async #generateIpfsLink(nftName) {
        const ipfsData = ClutchPlay.LAUNCHPAD_INFO[nftName].ipfsData;
        const url = `https://beta.api.clutchplay.ai/generate`;

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
            // 'Authorization': 'Bearer ',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'https://beta.clutchplay.ai',
            'Referer': 'https://beta.clutchplay.ai/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'network-id': '59144',
            'network-name': 'Linea Mainnet',
            // 'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'sec-ch-ua-mobile': '?0',
            // 'sec-ch-ua-platform': '"Windows"'
        };
        
        const body = {
            campaign_id: ipfsData.campaign_id,
            model_id: ipfsData.model_id,
            prompt: this.#generateRandomPrompt(),
            variations: ipfsData.variations
        };

        const settings = {
            method: 'POST',
            timeout: 10000,
            headers: headers,
            body: JSON.stringify(body)
        };

        if (this.proxy) {
            settings.agent = new HttpsProxyAgent(this.proxy);
        }
        
        for (let i = 0; i < 10; i++) {
            try {
                const response = await fetch(url, settings);
                // if (response.status != 200) {
                //     throw new Error(response);
                // }
                return response;  // TODO: return ipfs link here
    
            } catch (e) {
                logger.debug(`Failed to generate IPFS link, server response: ${e.message}`);
                await sleep(randInt(2, 10));
            }
        }
    
        throw new Error(`Failed to generate IPFS link`);
    }

    #generateRandomPrompt() {
        const nounsDataset = txtToArray('./../data/nounsDataset.txt');
        const adjectivesDataset = txtToArray('./../data/adjectivesDataset.txt');
        const wordsCount = randInt(1,3);

        return [adjectivesDataset, adjectivesDataset, nounsDataset].slice(3 - wordsCount).map(randomChoice).join(' ');
    };

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = ClutchPlay.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintedAmount = contract.balanceOf(this.signer.address);
        return await mintedAmount == 0 ? false : true;
    }
}