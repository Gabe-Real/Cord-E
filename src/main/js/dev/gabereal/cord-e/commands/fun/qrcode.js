const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qrcode')
        .setDescription('Generate a QR code from a link or text')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The link or message to turn into a QR code')
                .setRequired(true)
        ),

    async execute(interaction) {
        const text = interaction.options.getString('text');
        const channel = interaction.channel;

        const encoded = encodeURIComponent(text);
        const url = `https://quickchart.io/qr?text=${encoded}&dark=000000&light=ffffff&ecLevel=H`;

        const file = new AttachmentBuilder(url, { name: 'qrcode.png' });

        await interaction.reply({
            files: [file]
        });
    }
};
