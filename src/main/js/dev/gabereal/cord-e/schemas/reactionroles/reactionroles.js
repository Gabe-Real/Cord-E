const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
    guildId: String,
    messageId: String,
    channelId: String,
    roles: [
        {
            label: String,
            roleId: String,
            emoji: String,
            style: String
        }
    ]
});

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);
