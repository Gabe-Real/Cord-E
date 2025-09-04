const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Image commands to customise pictures.')
        .addSubcommand(sub =>
            sub
                .setName('blue')
                .setDescription('Get a nice blue version overlay on an avatar.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('blurple')
                .setDescription('Get a nice blurple overlay on an avatar.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('green')
                .setDescription('Get a nice green overlay on an avatar.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('red')
                .setDescription('Get a nice red overlay on an avatar.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('greyscale')
                .setDescription('Greyscale an image.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('invert')
                .setDescription('Invert the colours of an image.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('invertgreyscale')
                .setDescription('Invert the greyscale of an image.')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        )
        .addSubcommand(sub =>
            sub
                .setName('sepia')
                .setDescription('Get a nice sepia overlay on an avatar')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setRequired(true)
                        .setDescription('The user to create the avatar for.'))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        if (sub === 'blue') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/blue?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'blue.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'blurple') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/blurple2?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'blurple.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'green') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/green?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'green.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'red') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/red?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'red.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'greyscale') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/greyscale?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'greyscale.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'invert') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/invert?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'inverted.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }


        if (sub === 'invertgreyscale') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/invertgreyscale?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'invertgeryscale.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }

        if (sub === 'sepia') {
            await interaction.deferReply();

            const user = interaction.options.getUser('user') || interaction.user;
            const avatar = user.displayAvatarURL({ extension: 'png', size: 1024 });

            const response = await fetch(`https://api.some-random-api.com/canvas/filter/sepia?avatar=${encodeURIComponent(avatar)}`);

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const attachment = new AttachmentBuilder(buffer, { name: 'sepia.png' });

            await interaction.editReply({
                files: [attachment]
            });
        }
    }
}
