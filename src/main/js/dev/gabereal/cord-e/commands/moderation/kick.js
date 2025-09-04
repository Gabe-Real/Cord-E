const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Select a member and kick them.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The member to kick')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for kicking')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!targetMember) {
            return interaction.reply({ content: 'Could not find that user in the server.', ephemeral: true });
        }

        try {
            await targetMember.send(`You were kicked from **${interaction.guild.name}** for ${reason.toLowerCase()}`);
        } catch (err) {
            console.warn(`Could not DM ${target.tag}: ${err.message}`);
        }

        await interaction.reply(`Successfully **kicked** ${target.username} 💖`);
        await interaction.guild.members.kick(target);

    },
};