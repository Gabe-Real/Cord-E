const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cordicus')
        .setDescription('Commands that contain information about Cordicus.')
        .addSubcommand(sub =>
        sub.setName('twitch')
            .setDescription('Get information about Cordicus\' twitch.'))
        .addSubcommand(sub =>
        sub.setName('ko-fi')
            .setDescription('Get information about Cordicus\' ko-fi.'))
        .addSubcommand(sub =>
        sub.setName('youtube')
            .setDescription('Get information about Cordicus\' youtube.'))
        .addSubcommand(sub =>
        sub.setName('discord')
            .setDescription('Get information about Cordicus\' discord server.')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'twitch') {
            await interaction.reply({ content: '🟣 https://twitch.tv/cordicus', ephemeral: true });
        }

        if (sub === 'ko-fi') {
            await interaction.reply({ content: '🟠 https://ko-fi.com/cordicus', ephemeral: true });
        }

        if (sub === 'youtube') {
            await interaction.reply({ content: '🔴 https://youtube.com/@cordicus', ephemeral: true });
        }

        if (sub === 'discord') {
            await interaction.reply({ content: '🔵 https://discord.gg/6Ps98jXxND', ephemeral: true });
        }
    }
}