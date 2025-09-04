const mongoose = require('mongoose');

const CordboardPostSchema = new mongoose.Schema({
    messageId: { type: String, required: true, unique: true },
    starboardMsgId: String,
    originalChannelId: String,
    guildId: String,
});

module.exports = mongoose.model('CordboardPost', CordboardPostSchema);