const mongoose = require('mongoose');

const CordboardConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    emoji: String,
    threshold: Number,
    channelId: String,
});

module.exports = mongoose.model('CordboardConfig', CordboardConfigSchema);