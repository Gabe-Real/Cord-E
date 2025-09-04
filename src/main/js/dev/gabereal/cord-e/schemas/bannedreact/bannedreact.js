const mongoose = require('mongoose');

const bannedReactionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    banned: [
        {
            emoji: { type: String, required: true },
            addedBy: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('BannedReaction', bannedReactionSchema);
