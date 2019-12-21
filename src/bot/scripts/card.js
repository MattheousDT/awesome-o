"use strict";

const rp = require("request-promise-native");
const path = require("path");
const fs = require("fs");
const Axios = require('axios')
const discord = require("discord.js");
const jimp = require("jimp");
const Command = require("../script");
const {
    similarity,
    jimp: {
        printCenter,
        printCenterCenter
    }
} = require("../../utils");

const config = require("../../../config.json");

let sp16Font = null;
let sp18Font = null;
let sp25Font = null;
let sp27Font = null;
let sp60Font = null;

let frameOverlays = null;
let frameOutlines = null;
let frameTops = null;
let typeIcons = null;
let miscIcons = null;

function camelPad(str) {
    return str
        // Look for long acronyms and filter out the last letter
        .replace(/([A-Z]+)([A-Z][a-z])/g, " $1 $2")
        // Look for lower-case letters followed by upper-case letters
        .replace(/([a-z\d])([A-Z])/g, "$1 $2")
        // Look for lower-case letters followed by numbers
        .replace(/([a-zA-Z])(\d)/g, "$1 $2")
        .replace(/^./, function (str) {
            return str.toUpperCase();
        })
        // Remove any white space left around the word
        .trim();
}

let cache = {
    date: 2,
    cachedData: ""
}

const readDir = dirPath => {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (error, files) => {
            if (error == null) {
                return resolve(files);
            }
            reject(err);
        });
    });
};

const card = new Command({

    name: "Phone Destroyer Cards",
    description: "View any card from phone destroyer, rendered in real time with full stats!",
    help: "```\n[prefix]card <card name> <level / upgrade level>```\n*Replace items in triangle brackets with:*\n\n**card name:** Any existing Phone Destroyer card's name! If not spelt correctly, AWESOM-O will try to match the name.\n\n**level:** Simply put an l followed by 2, 3, 4, 5, 6 or 7 in this field and the card will display information from that level! You can also do ff to see the starts of a card in a friendly match! *(Common - lvl 4/Rare - lvl 3/Epic - lvl2/Legendary - lvl1)*\n\n**upgrade level:** Put a u followed by any number from 2 - 70 to see the specific stats of your card at a specific upgrade level! You can also do m followed by 1 - 7 to show the max upgrade for that level.\n\n**Example:** [prefix]card Towelie 6 **or** [prefix]card Towelie u42.",
    thumbnail: "https://cdn.discordapp.com/attachments/394504208222650369/509099660711821312/card.png",
    marketplace_enabled: true,

    type: "js",
    match_type: "command",
    match: "card",

    featured: false,

    preload: true,

    // -card <name>
    cb: async function (client, message, guild) {

        if (Date.now() - new Date(cache.date) > 1000 * 60 * 60) {
            await rp("https://sppd.feinwaru.com/api/v1/cards/list")
                .then(async responseCache => {
                    const requestCache = JSON.parse(responseCache)

                    cache.date = new Date()
                    cache.cachedData = requestCache
                })
                .catch(error => {
                    console.error(error)
                    const discordEmbed = new discord.RichEmbed()
                        .setColor('#F8534F')
                        .setTitle(":x: 1");
                    message.channel.send(discordEmbed);
                });
        }

        rp("https://sppd.feinwaru.com/api/v1/cards/list")
            .then(async response => {

                const cards = JSON.parse(response);


                // <prefix>card <name> | %r (<number | %r> | l<number | %r> | u<number | %r> | m<number | %r> | art | ff )

                // -card %r l5 DONE 
                // make it so you can only enter one of the following: a number (for the level), l<number>, u<number>, m<number>, ff, art DONE
                // extract the info entered after the card name, eg. { paramType: "level", value: 5 } from l5 DONE
                // make it so you can do %r instead of the numbers after l, u, m, eg. l%r, or u%r, which will select a random value within bounds e.g. (1-7 for l, m, and 1-70 for u) DONE

                const split = message.content.split(" ");

                const splitWithoutCmd = split.slice(1);

                //this is a fucking mess dont bother
                let cardName = [];

                let cardstats = []

                let commandValues = []

                let cardValues = ""

                //gets name
                for (let cmdWord of splitWithoutCmd) {

                    if (cmdWord === "ff" || cmdWord === "art" || (cmdWord.startsWith("l") || cmdWord.startsWith("m") || cmdWord.startsWith("u")) && (!isNaN(parseInt(cmdWord.slice(1))) || cmdWord.slice(1) === "%r")) {
                        continue;
                    }

                    cardName.push(cmdWord);

                }


                //more code handling
                cardName = cardName.join(" ").toLowerCase();
                commandValues.name = cardName

                //randomizes card
                if (commandValues.name === "%r") {
                    commandValues.name = cards.data[Math.floor(Math.random() * cards.data.length)].name
                }

                //checks it has level shit
                for (let stats of splitWithoutCmd) {

                    if (stats === "ff" || stats === "art" || (stats.startsWith("l") || stats.startsWith("m") || stats.startsWith("u")) && (!isNaN(parseInt(stats.slice(1))) || /%r$/g.test())) {

                        cardstats.push(stats)
                    }
                }


                //code handling
                if (cardstats.length != 0) {
                    if (cardstats.length > 1) {
                        return message.channel.send("Invalid Parameters")
                    }

                    cardValues = cardstats[0]

                    if (cardValues.length > 3) {
                        return console.error("noo")
                    }

                    if (isNaN(parseInt(cardValues.slice(1)))) {
                        commandValues.modifier = cardstats[0]
                    } else {

                        commandValues.modifier = cardValues[0]

                        if (cardValues.length == 3) {
                            commandValues.value = cardValues.substr(1, 2)
                        }
                        if (cardValues.length == 2) {
                            commandValues.value = cardValues[1]
                        }

                    }
                    //randomizes level
                    if (cardValues.slice(1) === "%r" && cardValues[0] === "u") {
                        commandValues.upgrade = Math.floor(Math.random() * 70) + 1
                        commandValues.modifier = cardValues[0]
                    }
                    if (cardValues.slice(1) === "%r" && (cardValues[0] === "l" || cardValues[0] === "m")) {
                        commandValues.value = Math.floor(Math.random() * 7) + 1
                        commandValues.modifier = cardValues[0]
                    }
                }

                //checks if values are within bounds and some hardcoded shit
                if (((commandValues.modifier == "m") || (commandValues.modifier === "l")) && ((commandValues.value > 7) || (commandValues.value < 1))) {
                    return console.log("out of bounds")
                }

                if (commandValues.modifier == "u" && ((commandValues.value > 70) || (commandValues.value < 1))) {
                    return console.log("out of bounds")
                }
                if (commandValues.modifier === undefined) {
                    commandValues.modifier = "l"
                }
                if (commandValues.value === undefined) {
                    commandValues.value = 1
                }


                if (commandValues.name === "%r %r") {
                    commandValues.name = cards.data[Math.floor(Math.random() * cards.data.length)].name
                    commandValues.modifier = "l"
                    commandValues.value = Math.floor(Math.random() * 7)
                }

                commandValues.value = parseInt(commandValues.value)

                let highestToDate = 0;
                let highestCard = null;


                // card name - similarity
                for (let card of cards.data) {
                    const lowerArray = card.name.toLowerCase();

                    let sim = similarity(lowerArray, commandValues.name)

                    if (sim > highestToDate) {
                        highestToDate = sim;
                        highestCard = card;
                    }

                }

                if (highestToDate < 0.4) {
                    console.error("Card Not Found");
                }
                commandValues.matchedCards = highestCard
                commandValues.similarity = highestToDate

                const cars = ["ford-lemon", "lambo-range", "ferra-pple", "peug-rapes"];

                const url = "https://sppd.feinwaru.com/backgrounds/" + commandValues.matchedCards.image + ".jpg"

                const pathResolve = path.resolve(__dirname, '../assets/cards/art/', commandValues.matchedCards.image + ".jpg")

                const directoryPath = path.join(__dirname, '../assets/cards/art/');

                await readDir(directoryPath)
                    .then(async files => {

                        let result = true;
                        for (let downloadfiles of files) {
                            if (downloadfiles.includes(commandValues.matchedCards.image + ".jpg")) {
                                result = false;
                            }
                        }

                        if (result) {
                            const response = await Axios({
                                method: 'GET',
                                url,
                                responseType: 'stream'
                            })

                            await response.data.pipe(fs.createWriteStream(pathResolve))

                            await (new Promise((resolve, reject) => {
                                response.data.on('end', () => {
                                    resolve()
                                })

                                response.data.on('error', error => {
                                    reject(error)
                                })
                            }));
                        }
                    })

                    .catch(console.error);

                const cardId = commandValues.matchedCards._id
                console.log(commandValues)

                rp("https://sppd.feinwaru.com/api/v1/cards/" + cardId)
                    .then(async response1 => {

                        const data1 = JSON.parse(response1);

                        let cardData = data1.data

                        // deep copy cards so we can replace shit

                        // render frames for the website

                        // legacy command support

                        // card <name>
                        // card <name> <level>
                        // card <name> l<level>
                        // card <name> u<upgrade, which is level but goes from 1-70>

                        let level = commandValues.value;

                        // card select
                        let card = data1.data;

                        // if name is %r, select a random card

                        // -card <name> (art)
                        // where name is compulsory
                        // and art is optional

                        // find the card by % match

                        if (commandValues.modifier === "art") {

                            return message.channel.send("", {
                                file: path.join(__dirname, "..", "assets", "cards", "art", `${card.image}.jpg`)
                            }).catch(err => {

                                message.channel.send(`error sending card art: ${err}`);
                            });
                        }

                        // friendly-fight/challenge stats
                        // ignore this if the command is -card ff,
                        // and assume 'ff' is a card name instead
                        // this needs to be called after card search
                        // as we need the rarity of the card


                        function _calculateCardAugmentData(original, utype, uvalue) {
                            const card = original;

                            const upgradeSequence = [4, 10, 10, 15, 15, 15];

                            const baseLevel = 1;
                            const baseUpgrade = 1;

                            const type = utype;
                            if (type == null) {
                                return console.error("no type specified");
                            }
                            if (type !== "u" && type !== "l") {
                                return console.error("incorrect type specified");
                            }

                            const value = parseInt(uvalue);
                            if (isNaN(value) === true) {
                                return console.error("no value specified");
                            }
                            if (typeof value !== "number") {
                                return console.error("incorrect value specified");
                            }
                            if (value < 1 || (type === "l" && value > 7) || (type === "u" && value > 70)) {
                                return console.error("out of bounds value specified");
                            }

                            let requiredLevels = 0;
                            let requiredUpgrades = 0;

                            if (type === "u") {
                                let currentLevels = 0;
                                let currentUpgrades = 0;

                                for (let i = 0; i < upgradeSequence.length; i++) {
                                    currentUpgrades += upgradeSequence[i];

                                    if (value < (currentUpgrades + baseUpgrade + 1)) {
                                        break;
                                    }

                                    currentLevels++;
                                }

                                requiredLevels = currentLevels;
                                requiredUpgrades = value - baseUpgrade;
                            }

                            if (type === "l") {
                                requiredLevels = value - baseLevel;
                                requiredUpgrades = upgradeSequence.slice(0, requiredLevels).reduce((a, c) => a + c, 0);
                            }

                            const addReduceSlot = (a, c) => a[c.property] == null ? {
                                ...a,
                                [c.property]: c.value
                            } : {
                                ...a,
                                [c.property]: a[c.property] + c.value
                            };
                            const alteredStats = card.tech_tree.slots.slice(0, requiredUpgrades).reduce(addReduceSlot, card.tech_tree.levels.slice(0, requiredLevels).reduce((a, c) => [...a, ...c.slots], []).reduce(addReduceSlot, {}));

                            // stat merge
                            // deep copy cos gay things
                            let alteredCard = JSON.parse(JSON.stringify(card));

                            if (alteredStats.power_unlock != null) {
                                alteredCard.is_power_locked = false;
                                delete alteredStats.power_unlock;
                            }

                            alteredCard = [alteredStats].reduce((a, c) => {
                                for (let [k, v] of Object.entries(c)) {
                                    if (k.startsWith("stat_")) {
                                        if (a[k.slice(5)] != null) {
                                            a[k.slice(5)] += v;
                                        } else if (a[k.slice(9)] != null) {
                                            a[k.slice(9)] += v;
                                            9
                                        } else {
                                            return console.error("error applying upgrade stats 1: " + k);
                                        }
                                    } else if (k.startsWith("power_")) {
                                        const powerIndex = a.powers.findIndex(e => e.type === k)

                                        if (powerIndex !== -1) {
                                            a.powers[powerIndex].amount += v;
                                        } else {
                                            // if power duration is specified, assume
                                            //  that there is only one power
                                            if (k === "power_duration") {
                                                a.powers[0].duration += v;
                                            } else if (k === "power_range" && cardData._id != "5caba684c83b14195097bf24") {
                                                a.powers[0].radius += v;
                                            } else if (cardData._id === "5caba684c83b14195097bf24") {

                                            } else {
                                                return console.error("error applying upgrade stats 2: " + k);
                                            }
                                        }

                                    } else {
                                        return console.error("error applying upgrade stats 3");
                                    }
                                }

                                return a;
                            }, alteredCard);


                            alteredCard.description = alteredCard.description.replace(/\{(.*?)\}/g, match => {
                                const bracketless = match.slice(1, match.length - 1);
                                //console.log(alteredCard);

                                function getPowerAmount(powerType) {
                                    return alteredCard.powers.find(power => {
                                        return power.type === powerType
                                    }).amount;
                                }

                                if (alteredCard[bracketless] == null) {

                                    if (bracketless === "power_hero_damage") {
                                        let powerAmount = getPowerAmount("power_hero_damage");
                                        if (powerAmount == null) {
                                            return getPowerAmount("power_damage") / 10;
                                        } else {
                                            return powerAmount;
                                        }
                                    } else if (bracketless === "power_duration_min") {
                                        return alteredCard.powers[0].duration - 1;
                                    } else if (bracketless === "power_duration_max") {
                                        return alteredCard.powers[0].duration + 1;
                                    } else if (bracketless === alteredCard.power_type) {
                                        return alteredCard.power_amount;
                                    } else if (bracketless === "power_duration") {
                                        return alteredCard.powers[0].duration;
                                        //this is fucked up, I know, baby - do an array for these ones, if string - power_ is "poison, damage, attack_boost, heal", just return getPowerAmount - a.k.a. optimze later
                                    } else if (bracketless === "power_poison") {
                                        return getPowerAmount('power_poison');
                                    } else if (bracketless === "power_damage") {
                                        return getPowerAmount("power_damage");
                                    } else if (bracketless === "power_attack_boost") {
                                        return getPowerAmount("power_attack_boost");
                                    } else if (bracketless === "power_heal") {
                                        return getPowerAmount("power_heal");

                                    } else if (bracketless === "power_max_hp_gain") {
                                        return getPowerAmount("power_max_hp_gain");
                                    } else if (bracketless === "power_target") {
                                        return getPowerAmount("power_target");
                                    } else if (bracketless === "power_max_hp_loss") {
                                        return getPowerAmount("power_max_hp_loss");
                                    } else if (bracketless === "power_attack_decrease") {
                                        return getPowerAmount("power_attack_decrease");
                                    } else {
                                        return "undefined";
                                    }

                                } else {
                                    return alteredCard[bracketless];
                                }
                            });

                            // if power is locked, assume only one power present
                            if ((alteredCard.powers[0] || {}).locked === true) {
                                alteredCard.description = "Power locked at this level/upgrade."
                            }

                            return alteredCard;
                        }
                        let stats = _calculateCardAugmentData(cardData, commandValues.modifier, commandValues.value)

                        /* --- pasted old code --- */

                        // Get the frame outline.
                        const frameWidth = 305;
                        const frameHeight = 418;

                        let x, y, z, w;

                        switch (card.rarity) {
                            case 0: // common
                                y = 0;
                                switch (card.theme) {
                                    case "adventure":
                                        x = frameWidth;
                                        break;
                                    case "sci-fi":
                                        x = frameWidth * 2;
                                        break;
                                    case "mystical":
                                        x = frameWidth * 3;
                                        break;
                                    case "fantasy":
                                        x = frameWidth * 4;
                                        break;
                                    case "superhero":
                                        x = frameWidth * 5;
                                        break;
                                    case "general":
                                        x = 0;
                                        break;
                                    default:

                                        message.reply("theme not found 1");
                                        return;
                                }
                                break;
                            default:
                                y = frameHeight;
                                switch (card.theme) {
                                    case "adventure":
                                        x = frameWidth;
                                        break;
                                    case "sci-fi":
                                        x = frameWidth * 2;
                                        break;
                                    case "mystical":
                                        x = frameWidth * 3;
                                        break;
                                    case "fantasy":
                                        x = frameWidth * 4;
                                        break;
                                    case "superhero":
                                        x = frameWidth * 5;
                                        break;
                                    case "general":
                                        x = 0;
                                        break;
                                    default:
                                        console.log(commandValues)
                                        message.reply("theme not found 2");
                                        return;
                                }
                                break;
                        }

                        z = frameWidth;
                        w = frameHeight;

                        // Get the frame top.
                        const topWidth = 338;
                        const topHeight = 107;

                        let fx, fy, fz, fw;

                        fx = 0;

                        switch (card.rarity) {
                            case 0: // common
                                fy = undefined;
                                break;
                            case 1:
                                fy = 0;
                                break;
                            case 2:
                                fy = topHeight;
                                break;
                            case 3:
                                fy = topHeight * 2;
                                break;
                            default:
                                message.reply("rarity not found");
                                return;
                        }

                        fz = topWidth;
                        fw = topHeight;

                        // Get the icon.
                        const iconWidth = 116;
                        const iconHeight = 106;

                        let ix, iy, iz, iw;

                        //temp
                        const typetype = card.type;
                        //

                        switch (card.character_type) {
                            case "tank":
                                iy = 0;
                                break;
                            case undefined: {
                                switch (typetype) {
                                    case "spell": {
                                        iy = iconHeight * 2;
                                        break;
                                    }

                                    case "trap": {
                                        iy = iconHeight * 14;
                                        break;
                                    }
                                }
                                break;
                            }
                            case "assassin":
                                iy = iconHeight * 4;
                                break;
                            case "ranged":
                                iy = iconHeight * 6;
                                break;
                            case "melee":
                                iy = iconHeight * 8;
                                break;
                            case "totem":
                                iy = iconHeight * 10;
                                break;
                        }

                        switch (card.rarity) {
                            case 0: // common
                                switch (card.theme) {
                                    case "general":
                                        ix = 0;
                                        break;
                                    case "adventure":
                                        ix = iconWidth;
                                        break;
                                    case "sci-fi":
                                        ix = iconWidth * 2;
                                        break;
                                    case "mystical":
                                        ix = iconWidth * 3;
                                        break;
                                    case "fantasy":
                                        ix = iconWidth * 4;
                                        break;
                                    case "superhero":
                                        ix = iconWidth * 5;
                                        break;
                                }
                                break;
                            case 1:
                                iy += iconHeight;
                                ix = 0;
                                break;
                            case 2:
                                iy += iconHeight;
                                ix = iconWidth;
                                break;
                            case 3:
                                iy += iconHeight;
                                ix = iconWidth * 2;
                                break;
                        }

                        iz = iconWidth;
                        iw = iconHeight;

                        // Get the overlay.
                        const overlayWidth = 305;
                        const overlayHeight = 418;

                        let ox, oy, oz, ow;

                        oy = 0;

                        switch (card.character_type) {
                            case undefined:
                                ox = overlayWidth;
                                break;
                            default:
                                ox = 0;
                                break;
                        }

                        oz = overlayWidth;
                        ow = overlayHeight;

                        // Card theme icons.
                        const themeIconWidth = 36;
                        const themeIconHeight = 24;

                        let tx, ty, tz, tw;

                        ty = 0;

                        switch (card.theme) {
                            case "general":
                                tx = 0;
                                break;
                            case "adventure":
                                tx = themeIconWidth;
                                break;
                            case "sci-fi":
                                tx = themeIconWidth * 2;
                                break;
                            case "mystical":
                                tx = themeIconWidth * 3;
                                break;
                            case "fantasy":
                                tx = themeIconWidth * 4;
                                break;
                            case "superhero":
                                tx = themeIconWidth * 5;
                                break;
                            default:
                                message.reply("theme not found 3");
                                return;
                        }

                        tz = themeIconWidth;
                        tw = themeIconHeight;

                        // Crystal things.
                        const crystalSheet = {
                            x: 0,
                            y: 24,
                            width: 180,
                            height: 76 // 36 + 4 + 36
                        };

                        const crystalWidth = 36;
                        const crystalHeight = 36;

                        let cx, cy, cz, cw;

                        cy = crystalSheet.y;

                        switch (card.rarity) {
                            case 0: // common
                                switch (card.theme) {
                                    case "general":
                                        cx = 0;
                                        break;
                                    case "adventure":
                                        cx = crystalWidth;
                                        break;
                                    case "sci-fi":
                                        cx = crystalWidth * 2;
                                        break;
                                    case "mystical":
                                        cx = crystalWidth * 3;
                                        break;
                                    case "fantasy":
                                        cx = crystalWidth * 4;
                                        break;
                                    case "superhero":
                                        cx = crystalWidth * 5;
                                        break;
                                    default:
                                        message.reply("theme not found 4");
                                        return;
                                }
                                break;
                            case 1:
                                cy += crystalHeight + 4;
                                cx = 17;
                                break;
                            case 2:
                                cy += crystalHeight + 4;
                                cx = 34 + crystalWidth;
                                break;
                            case 3:
                                cy += crystalHeight + 4;
                                cx = 34 + crystalWidth * 2;
                                break;
                            default:
                                message.reply("rarity not found");
                                return;
                        }

                        cz = crystalWidth;
                        cw = crystalHeight;

                        if (card.rarity === 3) {
                            cz += 17;
                        }
                        /* --- end of old code --- */

                        // Make the image.
                        const bgWidth = 455;
                        const bgHeight = 630;

                        // image overlaying stuff.
                        let bg = await new jimp(800, 1200);
                        let cardArt = await jimp.read(path.join(__dirname, '../assets/cards/art/', commandValues.matchedCards.image + ".jpg"));
                        let frameOverlay = frameOverlays
                            .clone()
                            .crop(ox, oy, oz, ow)
                            .resize(bgWidth, bgHeight);
                        let frameOutline = frameOutlines
                            .clone()
                            .crop(x, y, z, w)
                            .resize(bgWidth, bgHeight);
                        let typeIcon = typeIcons.clone().crop(ix, iy, iz, iw).scale(1.5);
                        let themeIcon = miscIcons.clone().crop(tx, ty, tz, tw).scale(1.5);
                        let crystal = miscIcons.clone().crop(cx, cy, cz, cw).scale(1.5);

                        let frameTop;
                        if (fy !== undefined) {
                            frameTop = frameTops
                                .clone()
                                .crop(fx, fy, fz, fw)
                                .resize(bgWidth + 49, 200);
                        }

                        bg.composite(
                            cardArt,
                            bg.bitmap.width / 2 - cardArt.bitmap.width / 2,
                            bg.bitmap.height / 2 - cardArt.bitmap.height / 2
                        );
                        bg.composite(
                            frameOverlay,
                            bg.bitmap.width / 2 - frameOverlay.bitmap.width / 2,
                            bg.bitmap.height / 2 - frameOverlay.bitmap.height / 2
                        );
                        bg.composite(
                            frameOutline,
                            bg.bitmap.width / 2 - frameOutline.bitmap.width / 2,
                            bg.bitmap.height / 2 - frameOutline.bitmap.height / 2
                        );

                        if (fy !== undefined) {
                            bg.composite(
                                frameTop,
                                bg.bitmap.width / 2 - frameTop.bitmap.width / 2 - 8,
                                240
                            );
                        }

                        bg.composite(typeIcon, 130, 182);
                        bg.composite(
                            themeIcon,
                            bg.bitmap.width / 2 - themeIcon.bitmap.width / 2 - 168,
                            843
                        );

                        // 3 = legendary
                        let xoffset = 0;
                        if (stats.rarity === 3) {
                            xoffset = 25;
                        }

                        bg.composite(
                            crystal,
                            bg.bitmap.width / 2 - themeIcon.bitmap.width / 2 - 168 - xoffset,
                            745
                        );

                        if (stats.name instanceof Array) {
                            printCenter(bg, sp25Font, 20, 315, stats.name[0]);
                        } else {
                            printCenter(bg, sp25Font, 20, 315, stats.name);
                        }

                        printCenter(bg, sp60Font, -168, 350, stats.mana_cost.toString());

                        if (ox === 0) {
                            printCenter(bg, sp27Font, -168, 515, stats.health.toString());
                            printCenter(bg, sp27Font, -168, 640, stats.damage.toString());
                        }

                        printCenter(bg, sp16Font, 17, 358, commandValues.modifier === "u" ? `u ${level}` : `lvl ${level}`);

                        printCenterCenter(bg, sp18Font, 20, 510, stats.description, 325);

                        //bg.autocrop(0.002, false);
                        bg.crop(135, 165, 526, 769);

                        // save + post
                        const saveDate = Date.now();

                        bg.write(path.join(__dirname, "temp", `pd-${saveDate}.png`), async () => {


                            const embed = new discord.RichEmbed();

                            // card name
                            if (cardData.name instanceof Array) {

                                embed.setAuthor(cardData.name[0]);
                            } else {

                                embed.setAuthor(cardData.name);
                            }

                            let embedColour = null;
                            switch (cardData.theme) {
                                case "adventure":
                                    embedColour = "#4f80ba";
                                    break;
                                case "fantasy":
                                    embedColour = "#d34f5f";
                                    break;
                                case "sci-fi":
                                    embedColour = "#db571d";
                                    break;
                                case "mystical":
                                    embedColour = "#4b9b38";
                                    break;
                                case "superhero":
                                    embedColour = "#fd6cf8";
                                    break;
                                case "general":
                                    embedColour = "#857468";
                                    break;
                                default:
                                    embedColour = "#857468";
                            }
                            embed.setColor(embedColour);

                            embed.setDescription("");

                            embed.description += "**General Information**\n";
                            if (cardData.cast_area === "own_side") {
                                embed.description += `Cast Area: Own Side\n`;
                            } else {
                                embed.description += `Cast Area: ${cardData.cast_area}\n`;
                            }
                            if (cardData.character_type !== "totem") {

                                embed.description += `Max Speed: ${Math.round(cardData.max_velocity * 100) / 100}\n`;
                                embed.description += `Time To Reach Max Speed: ${Math.round(cardData.time_to_reach_max_velocity * 100) / 100}\n`;
                                embed.description += `Agro Range Multiplier: ${Math.round(cardData.agro_range_multiplier * 100) / 100}\n\n`;
                            } else {

                                embed.description += "\n";
                            }

                            let hasPower = false;
                            if (cardData.powers.length !== 0) {
                                hasPower = true
                            }

                            // enforcer jimmy aura range
                            if (hasPower || cardData.name === "Enforcer Jimmy") {

                                embed.description += "**Power Information? - Yes**\n";

                                for (let field in cardData.powers[0]) {

                                    if (typeof cardData.powers[0][field] === "number" && field !== "charged_regen") {

                                        embed.description += `${field === "" ? field : camelPad(field.slice(5, field.length))}: ${typeof cardData.powers[0][field] === "number" ? Math.round(cardData.powers[0][field] * 100) / 100 : cardData.powers[0][field]}\n`;
                                        
                                    }
                                    
                                }

                                if (cardData.powers[0].charged_regen !== 0) {

                                    embed.description += `Charged Power Regen: ${Math.round(cardData.powers[0].charged_regen * 100) / 100}\n\n`;
                                } else {

                                    embed.description += "\n";
                                }

                            } else {

                                embed.description += "**Power Information? - No**\n\n";
                            }

                            if (cardData.type === "character" && cardData.can_attack && cardData.character_type !== "totem") {
                                // card that can attack

                                embed.description += "**Can Attack? - Yes**\n";

                                embed.description += `Attack Range: ${Math.round(cardData.attack_range * 100) / 100}\n`;
                                embed.description += `Knockback: ${Math.round(parseInt(cardData.knockback) * 100) / 100} at ${Math.round(cardData.knockback_angle * 100) / 100}°\n\n`;

                            } else {
                                // spell, totem or card that cant attack

                                embed.description += "**Can Attack? - No**\n\n";
                            }

                            if (cardData.has_aoe && cardData.type !== "spell") {
                                // aoe attacks

                                embed.description += "**AOE Attacks? - Yes**\n";

                                embed.description += `AOE damage Percentage: ${Math.round(cardData.aoe_damage_percentage * 100) / 100}\n`;
                                embed.description += `AOE Knockback Percentage: ${Math.round(cardData.aoe_knockback_percentage * 100) / 100}\n`;
                                embed.description += `AOE Radius: ${Math.round(cardData.aoe_radius * 100) / 100}\n\n`;

                            } else {
                                // no aoe

                                embed.description += "**AOE Attacks? - No**\n\n";
                            }

                            embed.description += `Full Stats: https://sppd.feinwaru.com/${cardData.image}`;

                            embed.setFooter("© 2018 Copyright: Feinwaru Software ");

                            // ***ATTACK INFO***

                            // -can attack
                            // -attack range
                            // -time in between attacks
                            // -pre attack delay
                            // -knockback impulse
                            // -aoe attack type
                            // -aoe damage percentage
                            // -aoe radius
                            // -aoe knockback percentage

                            // ***POWER INFO***

                            // -targeting ...
                            // -power duration

                            // ***SPEED INFO***

                            // -time to max velocity
                            // -max velocity

                            // ***totem ONLY***

                            // -health loss

                            // ***spell ONLY***



                            // *** ??? ***

                            // -requirements ...
                            // -child unit limit

                            // *name
                            // CanAttack
                            // *description
                            // *Image
                            // -ManaCost
                            // -damage
                            // -health
                            // healthLoss - character_type: totem
                            // type - if !Character, character_type === undefined
                            // Targeting ... - power radius
                            // character_type
                            // AttackRange
                            // TimeToMaxVelocity
                            // MaxVelocity
                            // TimeInBetweenAttacks
                            // PowerDuration
                            // -PowerPower
                            // -rarity
                            // -theme
                            // Requirements
                            // AOEAttacktype
                            // AOEdamagePercentage
                            // AOERadius
                            // AOEKnockbackPercentage
                            // PreAttackDelay
                            // CastArea - ownside/anywhere
                            // ChildUnitLimit

                            await message.channel.send("", {
                                file: path.join(__dirname, "temp", `pd-${saveDate}.png`)
                            });
                            message.channel.send(embed)
                            fs.unlink(path.join(__dirname, "temp", `pd-${saveDate}.png`), error => {
                                if (error !== null && error !== undefined) {

                                    throw `could not delete: pd-${saveDate}.png`;
                                }
                            });
                        });

                    })
                    .catch(error => {
                        console.error(error)
                        const discordEmbed = new discord.RichEmbed()
                            .setColor('#F8534F')
                            .setTitle(":x: Error. Its gay 1");
                        message.channel.send(discordEmbed);
                    });
            })
            .catch(error => {
                console.error(error)
                const discordEmbed = new discord.RichEmbed()
                    .setColor('#F8534F')
                    .setTitle(":x: Error. Its gay 2");
                message.channel.send(discordEmbed);
            });

    },

    load: function () {
        return new Promise((resolve, reject) => {

            const promises = [];

            promises.push(jimp.loadFont(path.join(__dirname, "..", "assets", "cards", "fonts", "SP-16.fnt"))
                .then(font => {
                    sp16Font = font;
                }));
            promises.push(jimp.loadFont(path.join(__dirname, "..", "assets", "cards", "fonts", "SP-18.fnt"))
                .then(font => {
                    sp18Font = font;
                }));
            promises.push(jimp.loadFont(path.join(__dirname, "..", "assets", "cards", "fonts", "SP-25.fnt"))
                .then(font => {
                    sp25Font = font;
                }));
            promises.push(jimp.loadFont(path.join(__dirname, "..", "assets", "cards", "fonts", "SP-27.fnt"))
                .then(font => {
                    sp27Font = font;
                }));
            promises.push(jimp.loadFont(path.join(__dirname, "..", "assets", "cards", "fonts", "SP-60.fnt"))
                .then(font => {
                    sp60Font = font;
                }));

            promises.push(jimp.read(path.join(__dirname, "..", "assets", "cards", "templates", "frame-overlay.png"))
                .then(image => {
                    frameOverlays = image;
                }));
            promises.push(jimp.read(path.join(__dirname, "..", "assets", "cards", "templates", "frame-outline.png"))
                .then(image => {
                    frameOutlines = image;
                }));
            promises.push(jimp.read(path.join(__dirname, "..", "assets", "cards", "templates", "frame-top.png"))
                .then(image => {
                    frameTops = image;
                }));
            promises.push(jimp.read(path.join(__dirname, "..", "assets", "cards", "templates", "card-character-type-icons.png"))
                .then(image => {
                    typeIcons = image;
                }));
            promises.push(jimp.read(path.join(__dirname, "..", "assets", "cards", "templates", "card-theme-icons.png"))
                .then(image => {
                    miscIcons = image;
                }));

            Promise.all(promises)
                .then(() => {
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
});




module.exports = card;