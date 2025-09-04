const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Get the banner of a user in multiple formats.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose banner you want to view.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const fetchedUser = await interaction.client.users.fetch(user.id, {
            force: true,
        });

        if (!fetchedUser.banner) {
            return await interaction.reply({
                content: `**${fetchedUser.username}** has no banner.`,
                ephemeral: true,
            });
        }

        const isGif = fetchedUser.banner.startsWith('a_');
        const baseUrl = `https://cdn.discordapp.com/banners/${fetchedUser.id}/${fetchedUser.banner}`;
        const previewURL = `${baseUrl}.${isGif ? 'gif' : 'png'}?size=1024`;

        const formats = isGif
            ? ['gif', 'png', 'jpg', 'webp']
            : ['png', 'jpg', 'webp'];



        const row = new ActionRowBuilder();

        formats.forEach(format => {
            row.addComponents(
                new ButtonBuilder()
                    .setLabel(format.toUpperCase())
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${baseUrl}.${format}?size=1024`)
            );
        });



        await interaction.reply({
            content: `## 🖼️ ${fetchedUser.username}'s Banner\n${previewURL}`,
            components: [row],
        });
    },
};
