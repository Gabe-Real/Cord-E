const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const WelcomeConfig = require('../../schemas/welcome/welcome');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configure the welcome message system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub =>
            sub.setName('join')
                .setDescription('Set welcome channel and message')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Where to send welcome messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Welcome message. Use {user}, {id}, or {mention} for tagging.')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('enable')
                .setDescription('Enable welcome/leave messages')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Which type of messages to enable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Join', value: 'join' },
                            { name: 'Leave', value: 'leave' },
                            { name: 'Both', value: 'both' }
                        )))
        .addSubcommand(sub =>
            sub.setName('disable')
                .setDescription('Disable welcome/leave messages')
                .addStringOption(opt =>
                    opt.setName('type')
                        .setDescription('Which type of messages to disable')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Join', value: 'join' },
                            { name: 'Leave', value: 'leave' },
                            { name: 'Both', value: 'both' }
                        )))
        .addSubcommand(sub =>
            sub.setName('nuke')
                .setDescription('Delete welcome config entirely'))
        .addSubcommand(sub =>
            sub.setName('leave')
                .setDescription('Set the leave channel and message')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Where to send welcome messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('message')
                        .setDescription('Leave message. Use {user}, {id}, or {mention} for tagging.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'join') {
            const channel = interaction.options.getChannel('channel');
            const message = interaction.options.getString('message');

            await WelcomeConfig.findOneAndUpdate(
                { guildId },
                { channelId: channel.id, message },
                { upsert: true }
            );

            return interaction.reply(`📝 Successfully set welcome config to send messages in ${channel} with custom message:\n> ${message}`);
        }

        if (sub === 'enable') {
            const type = interaction.options.getString('type');
            const update = {};

            if (type === 'join' || type === 'both') update.enabled = true;
            if (type === 'leave' || type === 'both') update.leaveEnabled = true;

            const config = await WelcomeConfig.findOneAndUpdate(
                { guildId },
                update,
                { new: true }
            );

            if ((type === 'join' || type === 'both') && (!config?.channelId || !config?.message)) {
                return interaction.reply({ content: 'Please run `/welcome join` first to set the join message.', ephemeral: true });
            }
            if ((type === 'leave' || type === 'both') && (!config?.leaveChannel || !config?.leaveMessage)) {
                return interaction.reply({ content: 'Please run `/welcome leave` first to set the leave message.', ephemeral: true });
            }

            return interaction.reply({ content: `${type === 'both' ? 'Join and leave' : `${type.charAt(0).toUpperCase() + type.slice(1)}`} messages enabled.`, ephemeral: true });
        }

        if (sub === 'disable') {
            const type = interaction.options.getString('type');
            const update = {};

            if (type === 'join' || type === 'both') update.enabled = false;
            if (type === 'leave' || type === 'both') update.leaveEnabled = false;

            await WelcomeConfig.findOneAndUpdate(
                { guildId },
                update
            );

            return interaction.reply({ content: `${type === 'both' ? 'Join and leave' : `${type.charAt(0).toUpperCase() + type.slice(1)}`} messages disabled.`, ephemeral: true });
        }

        if (sub === 'leave') {
            const message = interaction.options.getString('message');
            const channel = interaction.options.getChannel('channel');

            await WelcomeConfig.findOneAndUpdate(
                { guildId },
                { leaveChannel: channel.id, leaveMessage: message },
                { upsert: true }
            );

            return interaction.reply(`📝 Successfully set leave config to send messages in ${channel} with custom message:\n> ${message}`);
        }
    }
};
