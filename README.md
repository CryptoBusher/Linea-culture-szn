## 🚀 Linea Сulture SZN
Пак модулей для прохождения ончейн заданий в новой компании [Linea Culture SZN](https://app.layer3.xyz/campaigns/linea-culture-szn?slug=linea-culture-szn). Модули придется писать каждый день, потому следим за обновлениями. Советую клонировать репозиторий <i>(см. ["Как подтягивать обновления"](#%EF%B8%8F-%D0%BA%D0%B0%D0%BA-%D0%BF%D0%BE%D0%B4%D1%82%D1%8F%D0%B3%D0%B8%D0%B2%D0%B0%D1%82%D1%8C-%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F))</i> чтоб легко подтягивать обновления.

<i>Связь с создателем: https://t.me/CrytoBusher</i> <br>
<i>Если ты больше по Твиттеру: https://twitter.com/CryptoBusher</i> <br>

<i>Залетай сюда, чтоб не пропускать дропы подобных скриптов: https://t.me/CryptoKiddiesClub</i> <br>
<i>И сюда, чтоб общаться с крутыми ребятами: https://t.me/CryptoKiddiesChat</i> <br>

## 📖 Содержание
- [Актуальные модули](#-%D0%B0%D0%BA%D1%82%D1%83%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%BC%D0%BE%D0%B4%D1%83%D0%BB%D0%B8)
- [Как подтягивать обновления](#%EF%B8%8F-%D0%BA%D0%B0%D0%BA-%D0%BF%D0%BE%D0%B4%D1%82%D1%8F%D0%B3%D0%B8%D0%B2%D0%B0%D1%82%D1%8C-%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F)
- [Первый запуск](#-%D0%BF%D0%B5%D1%80%D0%B2%D1%8B%D0%B9-%D0%B7%D0%B0%D0%BF%D1%83%D1%81%D0%BA)
- [Дополнительная информация](#-%D0%B4%D0%BE%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F-%D0%B8%D0%BD%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%86%D0%B8%D1%8F)
- [Донат](#-%D0%B4%D0%BE%D0%BD%D0%B0%D1%82)

## 👨‍💻 Актуальные модули
- ~~massiveOne~~
- ~~crazyGang~~
- ~~push~~
- ~~wizards~~
- ~~eFrogs~~
- ~~satoshi~~
- ~~linusEggs~~
- ~~yoolia~~
- ~~frogWars~~
- ~~tcom~~
- ~~toads~~
- ~~ascendTheEnd~~
- **samuel**


## ⚙️ Как подтягивать обновления
Для подтягивания обнов необходимо клонировать репозиторий на ваш ПК (а не качать архивом). Вам понадобится [GIT](https://git-scm.com/), но это того стоит.
```
git clone https://github.com/CryptoBusher/Linea-culture-szn.git
```

После клонирования у вас появится папка с проектом, переходим в нее и производим настройки софта согласно инструкции в "Первый запуск". Для подтягивания обновлений, находясь в папке проекта, вписываем в терминале команду:
```
git pull
```

## 📚 Первый запуск
1. Устанавливаем [NodeJs](https://nodejs.org/en/download)
2. Скачиваем проект (архивом либо через "git clone" <i>(см. ["Как подтягивать обновления"](#%EF%B8%8F-%D0%BA%D0%B0%D0%BA-%D0%BF%D0%BE%D0%B4%D1%82%D1%8F%D0%B3%D0%B8%D0%B2%D0%B0%D1%82%D1%8C-%D0%BE%D0%B1%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D1%8F))</i>), в терминале, находясь в папке проекта, вписываем команду "npm i" для установки всех зависимостей
3. Меняем название файла "_wallets.txt" на "wallets.txt" и вбиваем свои кошельки, каждый с новой строки в формате "name|privateKey|httpProxy" или "name|privateKey" (если без прокси - будет использоваться GENERAL_PROXY_ADDRESS + GENERAL_PROXY_LINK из .env файла - мобильный прокси, если он указан, иначе - без прокси).  Если используете прокси, то формат должен быть такой: "http://user:pass@host:port".
4. Меняем название файла ".env.example" на ".env", открываем через любой текстовый редактор и заполняем:
    1. LINEA_RPC - нода
    2. GENERAL_PROXY_ADDRESS - мобильный прокси, который будет использован для кошельков без прокси (не обязательно)
    3. GENERAL_PROXY_LINK - ссылка на смену IP мобильного прокси (не обязательно)
    4. TG_BOT_TOKEN - токен Telegram бота (не обязательно)
    5. TG_CHAT_ID - ID чата, в который будут слаться уведомления. Можно указать чат супергруппы в формате "supergroupId/chatId" (не обязательно)
5. Меняем название файла "_config.js" на "config.js, открываем через любой редактор кода и заполняем (смотреть комментарии в файле).
6. Запускаем скрипт командой "node lineaCultureSzn.js". Если запускаетесь на сервере - "npm run start", тогда просмотреть лог можно в файле "out.log", а отслеживать в консоли прогресс можно командой "tail -f out.log".

## 🌵 Дополнительная информация
- Я не несу никакой ответственности за ваши средства.
- Подробный лог лежит в "src/logger/botlog.log"
- После прогона кошелек удаляется из текстовика "wallets.txt" и помещается в папку "results" в текстовик, содержащий в названии детали задачи (например, название NFT), а также статус ("Success"/"Fail"). Обязательно после анализа результатов все подтирать!

## 💴 Донат
Если хочешь поддержать мой канал - можешь мне задонатить, все средства пойдут на развитие сообщества.
<b>0x77777777323736d17883eac36d822d578d0ecc80</b>
