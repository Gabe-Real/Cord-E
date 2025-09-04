const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move members between voice channels.')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('Move a single user to another voice channel')
                .addUserOption(opt =>
                    opt.setName('target')
                        .setDescription('User to move')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel ID to move the user to')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('all')
                .setDescription('Move everyone from one VC to another')
                .addStringOption(opt =>
                    opt.setName('from')
                        .setDescription('Channel ID of the current voice channel')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('to')
                        .setDescription('Channel ID of the new voice channel')
                        .setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'user') {
            const target = interaction.options.getUser('target');
            const channelId = interaction.options.getString('channel');

            const member = await interaction.guild.members.fetch(target.id).catch(() => null);
            if (!member) return interaction.reply({ content: 'Could not find that member.', ephemeral: true });

            const newChannel = interaction.guild.channels.cache.get(channelId);
            if (!newChannel || newChannel.type !== 2) { 
                return interaction.reply({ content: 'Invalid channel ID (must be a voice channel).', ephemeral: true });
            }

            if (!member.voice.channel) {
                return interaction.reply({ content: `${target.tag} is not in a voice channel.`, ephemeral: true });
            }

            try {
                await member.voice.setChannel(newChannel);
                return interaction.reply({ content: `Moved **${target.tag}** to <#${newChannel.id}>.` });
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: 'Failed to move the user. Do I have permissions?', ephemeral: true });
            }
        }


        if (sub === 'all') {
            const fromId = interaction.options.getString('from');
            const toId = interaction.options.getString('to');

            const fromChannel = interaction.guild.channels.cache.get(fromId);
            const toChannel = interaction.guild.channels.cache.get(toId);

            if (!fromChannel || fromChannel.type !== 2) {
                return interaction.reply({ content: 'Invalid source channel ID (must be a voice channel).', ephemeral: true });
            }
            if (!toChannel || toChannel.type !== 2) {
                return interaction.reply({ content: 'Invalid destination channel ID (must be a voice channel).', ephemeral: true });
            }

            if (fromChannel.members.size === 0) {
                return interaction.reply({ content: 'No users are in that channel to move.', ephemeral: true });
            }

            try {
                for (const [_, member] of fromChannel.members) {
                    await member.voice.setChannel(toChannel).catch(() => {});
                }
                return interaction.reply({ content: `Moved all users from **${fromChannel.name}** to **${toChannel.name}**.` });
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: 'Failed to move all users. Do I have permissions?', ephemeral: true });
            }
        }
    }
};
