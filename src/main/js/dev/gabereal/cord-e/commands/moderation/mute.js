const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user for a period of time or unmute them')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('Mute a user')
                .addUserOption(o => o.setName('target').setDescription('User to mute').setRequired(true))
                .addStringOption(o => o.setName('time').setDescription('Mute time (e.g., 10m, 2h, 1d)').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('Reason for mute').setRequired(false))
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Unmute a user')
                .addUserOption(o => o.setName('target').setDescription('User to unmute').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('target');
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'Could not find that member.', ephemeral: true });
        }

        if (sub === 'user') {
            const timeStr = interaction.options.getString('time');
            const reason = interaction.options.getString('reason') || 'No reason provided.';
            const duration = ms(timeStr);

            if (!duration || duration < 1000 || duration > 28 * 24 * 60 * 60 * 1000) {
                return interaction.reply({
                    content: 'Invalid time. Must be between 1s and 28d (e.g. `10m`, `2h`, `1d`).',
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({ content: 'I cannot mute that user. Do I have permissions?', ephemeral: true });
            }


            await member.timeout(duration, reason);
            await targetUser.send(`You were muted in **${interaction.guild.name}** for ${timeStr}`)

            await interaction.reply({
                content: `Successfully **muted** ${targetUser.username} for ${timeStr} 💖`,
                allowedMentions: { users: [] }
            });

        }

        if (sub === 'clear') {
            if (!member.isCommunicationDisabled()) {
                return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
            }

            await member.timeout(null, 'Manual unmute via /mute clear');
            await targetUser.send(`You were unmuted in **${interaction.guild.name}**.`)

            await interaction.reply({
                content: `Successfully **unmuted** ${member.username}. 💖`,
                allowedMentions: { users: [] }
            });
        }
    }
};
