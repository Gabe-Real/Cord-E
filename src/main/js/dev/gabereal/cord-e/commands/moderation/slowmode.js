const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel via popup input'),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('set_slowmode_modal')
            .setTitle('Set Slowmode');

        const timeInput = new TextInputBuilder()
            .setCustomId('slowmode_time_input')
            .setLabel('Enter the slowmode time')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 10s, 5m, 1h, or 0 to disable')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(timeInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};
