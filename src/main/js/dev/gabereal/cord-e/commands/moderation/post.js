const { SlashCommandBuilder, PermissionFlagsBits, Colors, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post')
        .setDescription('Make the bot say something.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
        sub.setName('message')
            .setDescription('Post a message')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel to post to')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('content')
                    .setDescription('The message content to post')
                    .setRequired(true)
            )
        )
        .addSubcommand(sub =>
        sub.setName('embed')
            .setDescription('Post an embed')
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel to post to')
            )
            .addStringOption(option =>
                option.setName('style')
                    .setDescription('Choose a style preset')
                    .addChoices(
                        { name: 'Info', value: 'info' },
                        { name: 'Success', value: 'success' },
                        { name: 'Warning', value: 'warning' },
                        { name: 'Error', value: 'error' },
                        { name: 'Custom', value: 'custom' }
                    )
            )
            .addStringOption(option =>
                option.setName('title').setDescription('Title of the embed').setMaxLength(256)
            )
            .addStringOption(option =>
                option.setName('description').setDescription('Description text').setMaxLength(4000)
            )
            .addStringOption(option =>
                option.setName('color').setDescription('Hex color (e.g., #3498db)').setMaxLength(7)
            )
            .addStringOption(option =>
                option.setName('thumbnail').setDescription('Thumbnail image URL')
            )
            .addStringOption(option =>
                option.setName('image').setDescription('Main image URL')
            )
            .addBooleanOption(option =>
                option.setName('timestamp').setDescription('Add a timestamp?')
            )
            .addStringOption(option =>
                option.setName('footer').setDescription('Footer text')
            )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'message') {
            const message = interaction.options.getString('content');
            const channel = interaction.options.getChannel('channel');

            await interaction.reply({ content: `Done!`, ephemeral: true });
            await channel.send(message);

        } else if (sub === 'embed') {
            const channel = interaction.options.getChannel('channel');
            const style = interaction.options.getString('style');
            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const thumbnail = interaction.options.getString('thumbnail');
            const image = interaction.options.getString('image');
            const timestamp = interaction.options.getBoolean('timestamp');
            const footer = interaction.options.getString('footer');

            const styleColors = {
                info: Colors.Blurple,
                success: Colors.Green,
                warning: Colors.Yellow,
                error: Colors.Red,
                custom: Colors.White
            };

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(
                    style === 'custom' && colorInput
                        ? parseInt(colorInput.replace('#', ''), 16)
                        : styleColors[style]
                )

            if (thumbnail) embed.setThumbnail(thumbnail);
            if (image) embed.setImage(image);
            if (timestamp) embed.setTimestamp();
            if (footer) embed.setFooter({ text: footer });

            await channel.send({ embeds: [embed] })
            await interaction.reply({ content: 'Done!', ephemeral: true });
        }
    }
}