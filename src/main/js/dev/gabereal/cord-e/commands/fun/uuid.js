const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uuid')
        .setDescription('Fetch the Minecraft UUID of a player')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('The Minecraft username to lookup')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('username');
        await interaction.deferReply();

        try {
            const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
            if (!response.ok) {
                return interaction.editReply({content: `No Minecraft account found with the name **${username}**.`});
            }

            const data = await response.json();
            const shortUuid = data.id;
            const longUuid = [
                shortUuid.slice(0, 8),
                shortUuid.slice(8, 12),
                shortUuid.slice(12, 16),
                shortUuid.slice(16, 20),
                shortUuid.slice(20)
            ].join('-');

            return interaction.editReply({
                content: `## 🏓 ${username}'s UUIDs:\n**Long:** \`${longUuid}\`\n**Short:** \`${shortUuid}\``
            });
        } catch (err) {
            console.error('[UUID Error]', err);
            return interaction.editReply({content: 'Error fetching UUID. Try again later.'});
        }
    }
}