const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    warnings: [
        {
            reason: String,
            date: { type: Date, default: Date.now },
            moderatorId: String
        }
    ]
});

module.exports = mongoose.model('Warn', warnSchema);
