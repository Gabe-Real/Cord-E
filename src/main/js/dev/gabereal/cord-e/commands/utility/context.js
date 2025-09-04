const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('context')
        .setDescription('Get the context of a message.')
        .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to get the context of')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The messageId to get the context of')
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        const context = await channel.messages.fetch(message);
        await interaction.reply({ content: `## 🔍 Context of ${message}\n${context.content} - ${channel}`, ephemeral: true });
    }
}