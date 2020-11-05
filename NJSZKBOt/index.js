/// <reference path="persistence/model/user.js" />
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;

const mongoose = require("mongoose");
const DiscordUser = require("../NJSZKBOt/persistence/model/user");

bot.login(TOKEN);
mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USR}:${process.env.MONGODB_PW}@cluster0.dyryj.mongodb.net/${process.env.MONGODB_DB}?retryWrites=true&w=majority`,
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
                        msg.channel.send(`${msg.author} has leveled up, current level: ${discordUser.currentLvl}`);
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
        let quote = "Dear" + `${msg.author}` + process.env.NEUMANN_QUOTE;
        msg.reply(quote);
    }


    if (msg.content.includes("#szint") || msg.content.includes("#level")) {
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
        .setTitle(`${userName} level data`)
        .setURL('http://njszk.uni-obuda.hu/')
        .setAuthor(`${userName}`, `${userAvatar}`, 'http://njszk.uni-obuda.hu/')
        .setDescription("User experience and level data")
        .setThumbnail('http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png')
        .addFields(
            { name: `${userName} level`, value: `${userLvl}`, inline: true },
            { name: `${userName} experience points`, value: `${userExp}`, inline: true },
        )
        .setImage('http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png')
        .setTimestamp()
        .setFooter('By Obuda University John von Neumann College for Advanced Studies', 'http://njszk.uni-obuda.hu/wp-content/themes/njszk/sources/logo.png');

    return exampleEmbed;
}