const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for the unban')
                .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const bans = await interaction.guild.bans.fetch();
            const banInfo = bans.get(userId);

            if (!banInfo) {
                return interaction.reply({ content: 'That user is not banned.', ephemeral: true });
            }

            await interaction.guild.members.unban(userId, reason);
            return interaction.reply({ content: `Successfully **unbanned** <@${userId}> 💖`, ephemeral: false });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'Failed to unban the user. Do I have permissions?', ephemeral: true });
        }
    }
};