const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const crypto = require('node:crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skin')
        .setDescription('View a Minecraft player’s skin by username.')
        .addStringOption(opt =>
            opt.setName('username')
                .setDescription('The Minecraft username')
                .setRequired(true)
        ),

    async execute(interaction) {
        const username = interaction.options.getString('username');

        try {
            const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
            if (!response.ok) {
                return interaction.reply({ content: `Could not find a Minecraft account for \`${username}\`.`, ephemeral: true });
            }

            const data = await response.json();
            const uuid = data.id;

            function hashUUID(uuid, algorithm = 'sha256') {
                return crypto.createHash(algorithm).update(uuid).digest('hex');
            }

            const hashedUUID = hashUUID(uuid);

            const skinUrl = `https://visage.surgeplay.com/full/${uuid}`;
            const renderUrl = `https://crafatar.com/renders/body/${uuid}?overlay`;

            const embed = new EmbedBuilder()
                .setTitle(`🧱 Skin of ${username}`)
                .setDescription(`Here's the Minecraft skin for **${username}**`)
                .setImage(skinUrl)
                .setColor(0x00b894)
                .setFooter({ text: `UUID: ${uuid}` });

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('View Full Skin')
                    .setStyle(ButtonStyle.Link)
                    .setURL(skinUrl),
            );

            await interaction.reply({ embeds: [embed], components: [buttons] });
        } catch (err) {
            console.error('[skin command]', err);
            return interaction.reply({ content: 'An error occurred while fetching the skin.', ephemeral: true });
        }
    }
};
