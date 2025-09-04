const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AntiReply = require('../../schemas/replyping/replyping');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('replyping')
        .setDescription('Allow users to ping or not ping certain users on replying.')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a user to the protected list')
                .addUserOption(opt => opt.setName('user').setDescription('User to protect').setRequired(true))
                .addIntegerOption(opt => opt.setName('timeout').setDescription('Timeout in minutes').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a user from the protected list')
                .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all protected users')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: 'You need administrative permissions to use this command.',
                ephemeral: true
            });
        }

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        let doc = await AntiReply.findOne({ guildId });
        if (!doc) {
            doc = new AntiReply({ guildId, protectedUsers: [] });
        }

        if (sub === 'add') {
            const user = interaction.options.getUser('user');
            const timeout = (interaction.options.getInteger('timeout') || 10) * 60 * 1000;

            if (doc.protectedUsers.some(u => u.userId === user.id)) {
                return interaction.reply({ content: 'This user is already protected.', ephemeral: true });
            }

            doc.protectedUsers.push({ userId: user.id, timeout });
            await doc.save();
            return interaction.reply({ content: `Added ${user.tag} to protected list with a timeout of ${timeout / 60000} minutes.`, ephemeral: true });
        }

        if (sub === 'remove') {
            const user = interaction.options.getUser('user');
            doc.protectedUsers = doc.protectedUsers.filter(u => u.userId !== user.id);
            await doc.save();
            return interaction.reply({ content: `Removed ${user.tag} from protected list.`, ephemeral: true });
        }

        if (sub === 'list') {
            if (doc.protectedUsers.length === 0) return interaction.reply({ content: 'No protected users set.', ephemeral: true });
            const list = doc.protectedUsers.map(u => `<@${u.userId}>: ${u.timeout / 60000} min.`).join('\n');
            return interaction.reply({ content: `## 🔐 Protected users\n${list}`, ephemeral: true });
        }
    }
};
