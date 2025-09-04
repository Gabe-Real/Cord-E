const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits,} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to unban')
            .setRequired(true))
        .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the unban')
            .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        const targetMember = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!targetMember) {
            return interaction.reply({ content: 'Could not find that user in the server.', ephemeral: true });
        }

        if (!targetMember.bannable) {
            return interaction.reply({ content: 'You cannot unban that user.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(user.id, reason);
            await interaction.reply({ content: `Successfully **unbanned** ${user.username} 💖`, ephemeral: true });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'Failed to unban the user. Do I have permissions?', ephemeral: true });
        }
    }
};
