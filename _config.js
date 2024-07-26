import 'dotenv/config';


export const config = {
    /*
    massiveOne, crazyGang, push, wizards, eFrogs, satoshi, linusEggs, yoolia
    frogWars, tcom, toads, ascendTheEnd, samuel, townStory, kanVoyage, demmortal
    foxy, coopRecords, theSuperstars, chroniclesOfTheStars, crux, stonez
    */
    nftToMint: '',
    
    rpc: process.env.LINEA_RPC,                                 // Нода, подтягивается из .env файла
    generalProxy: {
        address: process.env.GENERAL_PROXY_ADDRESS,             // Прокси, подтягивается из .env файла
        link: process.env.GENERAL_PROXY_LINK,                   // Ссылка на смену IP, подтягивается из .env файла
        sleepTimeSec: 15                                        // Время ожидания после запроса на смену IP (ответ может быть положительным сразу, но прокси еще не будет готов)
    },

    telegramData: {	
		botToken: process.env.TG_BOT_TOKEN,                     // Токен Telegram бота, подтягивается из .env файла
		chatId: process.env.TG_CHAT_ID                          // ID чата для уведомлений (chatId или supergroupId/chatId), подтягивается из .env файла
	},

    accDelaySec: [300, 900],                                    // Задержка между аккаунтами в секундах (min, max)
    gasLimitMultipliers: [1.3, 1.6],                            // Увеличиваем gasLimit (min, max). AAVE депозит работает с дефолтным gasLimit (захардкодил)
};