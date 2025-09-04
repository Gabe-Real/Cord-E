const mongoose = require('mongoose');

const modNoteSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    notes: [
        {
            noteId: String,
            content: String,
            moderatorId: String,
            timestamp: Date,
        },
    ],
});

module.exports = mongoose.model('ModNote', modNoteSchema);
