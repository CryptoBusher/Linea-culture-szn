import fs from "fs";

import { ethers } from "ethers";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { HeaderGenerator } from 'header-generator';

import { logger } from "../logger/logger.js";
import { randFloat, sleep, randInt } from "../utils/helpers.js";


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
        },
        coopRecords: {
            contractData: {
                address: "0xAd626D0F8BE64076C4c27a583e3df3878874467E",
                abi: JSON.parse(fs.readFileSync('./src/abi/coopRecordsToken.json', "utf8"))
            },
            mintArgs: {
                voucher: {
                    netRecipient: '0x0000000000000000000000000000000000000000',
                    initialRecipient: '0x0000000000000000000000000000000000000000',
                    initialRecipientAmount: 0,
                    quantity: 1,
                    nonce: 1,
                    expiry: null,
                    price: 0,
                    tokenId: 1,
                    currency: '0x0000000000000000000000000000000000000000'
                },
                signature: null
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

    #generateHeaders() {
        const headerGenerator = new HeaderGenerator();

        while (true) {
            const headers = headerGenerator.getHeaders();
            const { 'sec-ch-ua': secChUa, 'user-agent': userAgent, 'sec-ch-ua-platform': platform } = headers;
    
            if (secChUa && userAgent && platform) {
                return [secChUa, userAgent, platform];
            }
        }
    }

    async#getCoopRecordsProof() {
        const url = `https://public-api.phosphor.xyz/v1/purchase-intents`;
        const [secChUa, userAgent, platform] = this.#generateHeaders();

        const headers = {
            'accept': '*/*',
            'accept-language': 'uk',
            'content-type': 'application/json',
            'origin': 'https://app.phosphor.xyz',
            'priority': 'u=1, i',
            'referer': 'https://app.phosphor.xyz/',
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': platform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': userAgent
        };

        const body = {
            buyer: {
                eth_address: this.signer.address
              },
              listing_id: 'fceb2be9-f9fd-458a-8952-9a0a6f873aff',
              provider: 'MINT_VOUCHER',
              quantity: 1
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
                if (![200, 201].includes(response.status)) {
                    throw new Error(response.status);
                }

                const proof = await response.json();

                if (!proof?.data?.voucher?.expiry) {
                    throw new Error('proof.data.voucher.expiry does not exist');
                }
                
                if (!proof?.data?.signature) {
                    throw new Error('proof.data.signature does not exist');
                }

                return proof;
            } catch (e) {
                logger.error(`Failed to get voucher, server response: ${e.message}, retrying after delay...`);
                await sleep(randInt(60, 180));  // Delay 1-3 minutes, max 10-30 minutes for wallet
            }
        }
    
        throw new Error(`Failed to get voucher`);
    }

    async mintNft(nftName) {
        logger.debug(`Trying to mint ${nftName}`);

        if (nftName == 'coopRecords') {
            return await this.#mintCoopRecords();
        }

        const contractData = Phosphor.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const maxMintFeeWei = BigInt(10000000000000);
        const value = await contract.getTransactionFee();
        if (await value > maxMintFeeWei) {
            throw Error(`Mint fee is ${value} but ${maxMintFeeWei} expected`);
        }

        const mintArgs = Phosphor.LAUNCHPAD_INFO[nftName].mintArgs;
        const mintArgsArray = Object.values(mintArgs);

        const estimatedGasLimit = await contract.claim.estimateGas(
            this.signer.address,
            ...mintArgsArray,
            { value }
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        const tx = await contract.claim(
            this.signer.address,
            ...mintArgsArray,
            { gasLimit, value }
        );

        const receipt = await tx.wait();
        return await receipt.hash;
    };

    async #mintCoopRecords() {
        const contractData = Phosphor.LAUNCHPAD_INFO.coopRecords.contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);

        const mintArgs = Phosphor.LAUNCHPAD_INFO.coopRecords.mintArgs;
        const proof = await this.#getCoopRecordsProof()
        mintArgs.voucher.expiry = proof.data.voucher.expiry
        mintArgs.signature = proof.data.signature

        const mintArgsArray = Object.values(mintArgs);

        const estimatedGasLimit = await contract.mintWithVoucher.estimateGas(
            ...mintArgsArray,
        );

        const gasLimit = estimatedGasLimit * BigInt(parseInt(this.#getGasLimitMultiplier() * 100)) / BigInt(100);
        const tx = await contract.mintWithVoucher(
            ...mintArgsArray,
            { gasLimit }
        );

        const receipt = await tx.wait();
        return await receipt.hash;
    }

    async isMinted(nftName) {
        logger.debug(`Checking if ${nftName} is minted`);

        const contractData = Phosphor.LAUNCHPAD_INFO[nftName].contractData;
        const contract = new ethers.Contract(contractData.address, contractData.abi, this.signer);
        const mintArgs = Phosphor.LAUNCHPAD_INFO[nftName].mintArgs;

        let tokenId;
        if (nftName == 'push') {
            tokenId = mintArgs._tokenId
        } else if (nftName == 'coopRecords') {
            tokenId = mintArgs.voucher.tokenId
        }

        const mintedAmount = await contract.balanceOf(this.signer.address, tokenId);
        return await mintedAmount == 0 ? false : true;
    }
}