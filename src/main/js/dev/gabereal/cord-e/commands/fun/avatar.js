const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get the avatar of a user in multiple formats.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose avatar you want to view.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const previewURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const formats = ['png', 'jpg', 'webp'];
        const isGif = user.avatar && user.avatar.startsWith('a_');
        if (isGif) formats.unshift('gif');



        const row = new ActionRowBuilder();

        formats.forEach(format => {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel(format.toUpperCase())
                    .setStyle(ButtonStyle.Link)
                    .setURL(user.displayAvatarURL({ extension: format, size: 1024 }))
            );
        });



        await interaction.reply({
            content: `## 📌 ${user.username}'s Avatar\n${previewURL}`,
            components: [row]
        });
    },
};
