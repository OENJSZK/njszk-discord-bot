/// <reference path="persistence/model/user.js" />
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const utf8 = require('utf8');
var encoding = require("encoding");

const mongoose = require("mongoose");
const DiscordUser = require("../discord-bot-sitepoint/persistence/model/user");

bot.login("NzczNjQ5MzQyOTMzODkzMTIx.X6MTGQ.ieBRLuTfwcgYa9PWPJnzYJg7F5o");
mongoose.connect(
    "mongodb+srv://discord_ops:discord_ops@cluster0.dyryj.mongodb.net/indekusu_bot?retryWrites=true&w=majority",
    {
        useNewUrlParser: true
    }
);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on("guildMemberAdd", function (member) {
    createDiscordUser(member.user.id);
});

bot.on('message', msg => {
    if (msg.author.id != bot.user.id) {
        const query = DiscordUser.findOne({ tag: msg.author.id })
            .then(discordUser => {
                if (discordUser) {
                    discordUser.currentExp = calculateExperience(discordUser.currentExp);
                    let previousLvl = discordUser.currentLvl;
                    let newLvl = calculateLevel(discordUser.currentExp);
                    if (newLvl - previousLvl > 1) {
                        discordUser.currentLvl = Math.round(newLvl);
                        msg.channel.send(`${msg.author} szintet lepett, szintje: ${discordUser.currentLvl}`);
                    }
                } else {
                    discordUser = createDiscordUser(msg.author.id);
                }
                discordUser.save().then(res => console.log(res)).catch(err => console.log(err));
            }).catch(err => {
                console.log(err);
            });
    }

    if (msg.mentions.users.some(user => user.id == bot.user.id)) {
        let quote = "Kedves" + `${msg.author}` + " Egyes fizikusok talan hatarozottan szubjektiv eloszeretettel viseltettek egyik vagy masik elmelet irant. De alig lehet ketseges, hogy a tudomanyos kozvelemeny vegul is csak azt a valtozatot fogja elfogadni, amely sikerrel mutatja az utat, szelesebb területeket tud meggyozobb erovel megmagyarazni.";
        msg.reply(quote);
    }


    if (msg.content.includes("#szint")) {
        const query = DiscordUser.findOne({ tag: msg.author.id })
            .then(user =>
                msg.reply(getEmbendForLevelQuery(msg.author.username, msg.author.displayAvatarURL(), user.currentLvl, user.currentExp))
            )
            .catch(err =>
                console.log(err)
            );
    }
});

function createDiscordUser(tag) {
    let user = new DiscordUser({
        _id: new mongoose.Types.ObjectId(),
        tag: tag,
        currentExp: 0,
        currentLvl: 0
    });
    user.save().then(user => {
        return user;
    }).catch(err => {
        reject(console.log(err))
    });
}

function calculateLevel(xp) {
    return (Math.sqrt(625 + 100 * xp) - 25) / 50;
}

function calculateExperience(xp) {
    return xp + 50;
}

function getEmbendForLevelQuery(userName, userAvatar, userLvl, userExp) {

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${userName} szintje`)
        .setURL('http://njszk.uni-obuda.hu/')
        .setAuthor(`${userName}`, `${userAvatar}`, 'http://njszk.uni-obuda.hu/')
        .setDescription("Szint adatok")
        .setThumbnail('http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png')
        .addFields(
            { name: `${userName} szintje`, value: `${userLvl}`, inline: true },
            { name: `${userName} tapasztalati pontjai`, value: `${userExp}`, inline: true },
        )
        .setImage('http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png')
        .setTimestamp()
        .setFooter('Készült az Óbudai Egyetem Neumann Jánosz Szakkollégiumában', 'http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png');

    return exampleEmbed;
}