const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colour')
        .setDescription('Get info about a colour')
        .addStringOption(option =>
            option
                .setName('hex')
                .setDescription('The hex code of the colour (e.g. ff9900)')
                .setRequired(true)
        ),

    async execute(interaction) {
        let hex = interaction.options.getString('hex');

        if (!hex) {
            hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
        } else {
            hex = hex.replace(/^#/, '');
        }

        if (!/^([0-9a-f]{6})$/i.test(hex)) {
            return interaction.reply({ content: 'Invalid hex code. Please use a format like `#ff9900` or `ff9900`.', ephemeral: true });
        }

        try {
            const res = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`);
            const data = await res.json();

            const jsHexLiteral = `0x${data.hex.clean.toLowerCase()}`;

            const embed = new EmbedBuilder()
                .setTitle(`🎨 Colour: ${data.name.value}`)
                .setDescription(`Hex: \`#${data.hex.clean}\`\nRGB: \`${data.rgb.value}\`\nHSL: \`${data.hsl.value}\`\nJS: \`${jsHexLiteral}\``)
                .setColor(`#${data.hex.clean}`)
                .setThumbnail(data.image.bare)
                .setFooter({ text: `Requested by ${interaction.user.tag}` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('View on color-hex.com')
                    .setURL(`https://www.color-hex.com/color/${data.hex.clean}`)
                    .setStyle(ButtonStyle.Link)
            );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (err) {
            console.error('[Colour Command Error]', err);
            await interaction.reply({ content: 'Failed to fetch colour data.', ephemeral: true });
        }
    }
};
