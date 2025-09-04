const mongoose = require('mongoose');

const welcomeSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    message: String,
    enabled: { type: Boolean, default: false },
    leaveChannel: String,
    leaveMessage: String,
    leaveEnabled: { type: Boolean, default: false },
});

module.exports = mongoose.model('WelcomeConfig', welcomeSchema);
