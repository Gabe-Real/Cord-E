const mongoose = require('mongoose');

const replypingSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    protectedUsers: [
        {
            userId: String,
            timeout: { type: Number, default: 10 * 60 * 1000 }
        }
    ]
});

module.exports = mongoose.model('AntiReplyPing', replypingSchema);
