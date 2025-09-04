const BannedReaction = require('../../schemas/bannedreact/bannedreact');

module.exports = {
    name: 'messageReactionAdd',
    async execute(reaction, user) {

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the reaction:', error);
                return;
            }
        }

        if (user.partial) {
            try {
                await user.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the user:', error);
                return;
            }
        }

        if (!reaction.message.guild || user.bot) return;

        try {
            const doc = await BannedReaction.findOne({ guildId: reaction.message.guild.id });
            if (!doc) return;

            const emojiKey = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;

            const isBanned = doc.banned.some(e => e.emoji === emojiKey || e.emoji === reaction.emoji.name || e.emoji === reaction.emoji.id);
            if (!isBanned) return;

            await reaction.users.remove(user.id);
            const member = await reaction.message.guild.members.fetch(user.id);

            if (member && member.moderatable) {
                try {
                    await user.send(`You tried to use a banned reaction in **${reaction.message.guild.name}**, so it was removed. `+
                        `Please refrain from using banned reactions on messages in this server or action will be taken.`);
                } catch {

                }
            }
        } catch (err) {
            console.error('Banned reaction handler error:', err);
        }
    }
};