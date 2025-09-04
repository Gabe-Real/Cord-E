const mongoose = require('mongoose');

const warnConfigSchema = new mongoose.Schema({
    guildId: String,
    dmMessage: { type: String, default: 'You have been warned for: {reason}' },
    warningThreshold: { type: Number, default: 3 },
    action: { type: String, enum: ['kick', 'ban', 'mute', 'none'], default: 'kick' }
});

module.exports = mongoose.model('WarnConfig', warnConfigSchema);
