const Tag = require('../../schemas/tags/tags');
const QuickPrefix = require('../../schemas/tags/quickTagsSchema');

async function quickTags(message) {
    try {
        if (!message.guild) return;

        const config = await QuickPrefix.findOne({ guildId: message.guild.id });
        if (!config) return;

        const prefix = config.prefix;
        if (!message.content.startsWith(prefix)) return;

        const name = message.content.slice(prefix.length).trim().toLowerCase();
        if (!name) return;

        const tag = await Tag.findOne({ guildId: message.guild.id, name });
        if (!tag) return;

        await message.channel.send({ content: tag.content });
    } catch (err) {
        console.error('[QuickTag Error]', err);
    }
}

module.exports = { handleQuickTag: quickTags };