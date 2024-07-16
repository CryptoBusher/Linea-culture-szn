// https://app.layer3.xyz/campaigns/linea-culture-szn?slug=linea-culture-szn

import fs from "fs";
import path from "path";

import { config } from './config.js';
import { logger } from './src/logger/logger.js';
import { TelegramBot } from './src/modules/telegram.js';
import { ElementLaunchpad } from './src/modules/elementLaunchpad.js';
import { ClutchPlay } from './src/modules/clutchplay.js';
import { Phosphor } from "./src/modules/phosphor.js";
import { Nfts2me } from "./src/modules/nfts2me.js";
import { Yooldo } from "./src/modules/yooldo.js";
import { ACG } from "./src/modules/acg.js";
import { SendingMe } from "./src/modules/sendingMe.js"
import { txtToArray, addLineToTxt, randomChoice, sleep, randInt, removeLineFromTxt, changeProxyIp, generateProviderAndSigner } from './src/utils/helpers.js'


const tgBot = config.telegramData.botToken ? new TelegramBot(config.telegramData.botToken, config.telegramData.chatId) : undefined;

const processSuccess = (walletData) => {
    const filePath = path.join('results', `${config.nftToMint}Success_SECRET.txt`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf-8');
    }
    addLineToTxt(filePath, walletData);
    removeWalletData(walletData);
};

const processFail = (walletData) => {
    const filePath = path.join('results', `${config.nftToMint}Fail_SECRET.txt`);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '', 'utf-8');
    }
    addLineToTxt(filePath, walletData);
    removeWalletData(walletData);
};

const removeWalletData = (walletData) => {
    removeLineFromTxt('wallets.txt', walletData);
};


const getRandomWalletData = () => {
    const walletsData = txtToArray('wallets.txt')
    return randomChoice(walletsData);
};


const getLaunchpad = (nftName, provider, signer, gasLimitMultipliers, proxy) => {
    const launchpads = [
        ElementLaunchpad,
        ClutchPlay,
        Phosphor,
        Nfts2me,
        Yooldo,
        ACG,
        SendingMe
    ];

    for (const launchpad of launchpads) {
        for (const name of Object.keys(launchpad.LAUNCHPAD_INFO)) {
            if (name === nftName) {
                return new launchpad(provider, signer, gasLimitMultipliers, proxy);
            }
        }
    }

    throw new Error(`No any launchpads found for ${nftName}`);
};

const startMinting = async(nftName) => {
    while (true) {
        try {
            const walletData = getRandomWalletData();
            if (!walletData) {
                logger.info('No any wallets remaining');
                if (tgBot) {
                    const tgMessage = `🚀 #completed\n\nNo any wallets remaining`;
                    await tgBot.sendNotification(tgMessage);
                }

                return;
            }

            let [ name, privateKey, proxy ] = walletData.split('|');

            try {    
                if (!proxy && config.generalProxy.address) {
                    logger.info(`${name} - using general proxy`);
                    proxy = config.generalProxy.address;
        
                    logger.info(`${name} - changing proxy ip`);
                    await changeProxyIp(config.generalProxy.link, config.generalProxy.sleepTimeSec);
                }

                const [ provider, signer ] = generateProviderAndSigner(privateKey, config.rpc, proxy);
                const launchpad = getLaunchpad(nftName, provider, signer, config.gasLimitMultipliers, proxy);

                if (await launchpad.isMinted(nftName)) {
                    logger.info(`${name} - already minted ${nftName}`);
                    processSuccess(walletData);

                    if (tgBot) {
                        const tgMessage = `🎯 #finished\n\n<b>Wallet: </b>${name}\n<b>Info: </b> Already minted ${nftName}`;
                        await tgBot.sendNotification(tgMessage);
                    }

                    continue;
                }

                logger.info(`${name} - trying to mint ${nftName}`);
                const hash = await launchpad.mintNft(nftName);
                logger.info(`${name} - success, hash: ${await hash}`);
                processSuccess(walletData);

                if (tgBot) {
                    const tgMessage = `✅ #success\n\n<b>Wallet: </b>${name}\n<b>Info: </b>Minted ${nftName}\n\<b>Links: </b> <a href="https://lineascan.build/address/${signer.address}">Wallet</a> | <a href="https://lineascan.build/tx/${hash}">Tx</a> | <a href="https://debank.com/profile/${signer.address}/history?chain=linea">DeBank</a>`;
                    await tgBot.sendNotification(tgMessage);
                };
            } catch (e) {
                logger.error(`${name} - failed to mint ${nftName}, reason: ${e.message}`);
                processFail(walletData);

                if (tgBot) {
                    const tgMessage = `⛔️ #fail\n\n<b>Wallet: </b>${name}\n<b>Info: </b> ${e.message}`;
                    await tgBot.sendNotification(tgMessage);
                };
            };

        } catch (e) {
            logger.error(`Unexpected error, reason: ${e.message}`);
            processFail(walletData);

            if (tgBot) {
                const tgMessage = `⛔️ #fail\n\n<Unexpected error, reason: ${e.message}`;
                await tgBot.sendNotification(tgMessage);
            };
        }

        const delayBeforeNext = randInt(config.accDelaySec[0], config.accDelaySec[1]);
        logger.info(`Sleeping ${(delayBeforeNext / 60).toFixed(2)} minutes before next`);
        await sleep(delayBeforeNext);
    }
};


startMinting(config.nftToMint);