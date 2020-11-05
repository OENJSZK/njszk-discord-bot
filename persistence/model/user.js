const mongoose = require("mongoose");

const discordUser = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tag: String,
    currentExp: Number,
    currentLvl: Number
});

module.exports = mongoose.model("DiscordUser", discordUser);

