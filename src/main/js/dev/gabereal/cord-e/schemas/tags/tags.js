const { Schema, model } = require('mongoose');

const tagSchema = new Schema({
    guildId: String,
    name: String,
    content: String,
    createdBy: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('Tag', tagSchema);
