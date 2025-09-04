const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const BannedReaction = require('../../schemas/bannedreact/bannedreact');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bannedreactions')
        .setDescription('Manage banned reactions in this server.')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Ban an emoji from being used in reactions.')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('Emoji to ban (custom or default).')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Unban a previously banned emoji.')
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('Emoji to unban.')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all banned reactions.')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You need administrative permissions to manage banned reactions.',
                ephemeral: true
            });
        }

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        let doc = await BannedReaction.findOne({ guildId });
        if (!doc) doc = new BannedReaction({ guildId, banned: [] });

        if (sub === 'add') {
            const emoji = interaction.options.getString('emoji');

            if (doc.banned.some(e => e.emoji === emoji)) {
                return interaction.reply({ content: 'That emoji is already banned.', ephemeral: true });
            }

            doc.banned.push({ emoji, addedBy: interaction.user.id });
            await doc.save();

            return interaction.reply({ content: `Successfully **banned** the emoji: ${emoji}`, ephemeral: false });
        }

        if (sub === 'remove') {
            const emoji = interaction.options.getString('emoji');
            doc.banned = doc.banned.filter(e => e.emoji !== emoji);
            await doc.save();

            return interaction.reply({ content: `Successfully **unbanned** the emoji: ${emoji}`, ephemeral: false });
        }

        if (sub === 'list') {
            if (doc.banned.length === 0) {
                return interaction.reply({ content: 'No banned reactions in this server.', ephemeral: true });
            }

            const list = doc.banned
                .map(e => `${e.emoji} - banned by **<@${e.addedBy}>**`)
                .join('\n');

            return interaction.reply({ content: `## 🔐 Banned reactions:\n${list}`, ephemeral: false });
        }
    }
};
