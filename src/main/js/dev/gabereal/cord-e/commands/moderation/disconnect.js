const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects a user from their voice channel.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to disconnect')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    async execute(interaction) {
        const target = interaction.options.getMember('target');

        if (!target) {
            return interaction.reply({ content: 'User not found.', ephemeral: true });
        }

        if (!target.voice.channel) {
            return interaction.reply({ content: 'That user is not in a voice channel.', ephemeral: true });
        }

        try {
            await target.voice.disconnect();
            await interaction.reply({ content: `Successfully disconnected **${target}** from their voice channel. <:NekoYay:1386313761589039255>`, ephemeral: true });
        } catch (err) {
            await interaction.reply({ content: 'Failed to disconnect the user. Do I have the right permissions?', ephemeral: true });
        }
    }
}