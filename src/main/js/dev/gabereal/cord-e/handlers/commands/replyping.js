const AntiReply = require('../../schemas/replyping/replyping');

module.exports = {
    name: 'replyping',

    async handle(client, message) {
        if (!message.guild || message.author.bot) return;
        if (!message.reference || !message.reference.messageId) return;

        try {
            const doc = await AntiReply.findOne({ guildId: message.guild.id });
            if (!doc || doc.protectedUsers.length === 0) return;

            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);

            const protectedUser = doc.protectedUsers.find(u => u.userId === repliedMessage.author.id);
            if (!protectedUser) return;

            if (message.mentions.users.has(repliedMessage.author.id)) {
                const member = await message.guild.members.fetch(message.author.id);

                if (!member.moderatable) return;

                await member.timeout(protectedUser.timeout, `Reply pinged protected user (${repliedMessage.author.tag})`);

                await message.delete().catch(() => {});

                await member.send(
                    `You have been timed out in **${message.guild.name}** for ${protectedUser.timeout / 60000} minutes ` +
                    `because you reply pinged **${repliedMessage.author.tag}**. Please do not reply` +
                    `ping members who are not allowed to be.`
                ).catch(() => {});
            }

        } catch (err) {
            console.error('Anti-reply system error:', err);
        }
    }
};
