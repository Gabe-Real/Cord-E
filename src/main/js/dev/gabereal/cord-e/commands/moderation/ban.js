const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function parseDuration(str) {
    const regex = /^(\d+)(s|m|h|d|y)?$/i;
    const match = str.match(regex);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2]?.toLowerCase() || 's';

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user by ID or username, optionally for a set time')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Ban duration (e.g. 10m, 1h, 2d, 1y). Leave empty for permanent.')),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const timeStr = interaction.options.getString('time');

        const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!targetMember) {
            return interaction.reply({ content: 'Could not find that user in the server.', ephemeral: true });
        }

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ content: 'I cannot ban that user. Do I have permissions?', ephemeral: true });
        }

        let durationMs = null;
        if (timeStr) {
            durationMs = parseDuration(timeStr);
            if (!durationMs) {
                return interaction.reply({ content: 'Invalid time format. Use values like `10m`, `1h`, `2d`, `1y`.', ephemeral: true });
            }
        }

        try {
            await target.send(`You were banned from **${interaction.guild.name}** for ${reason.toLowerCase()}. ${durationMs ? `This ban will expire in ${timeStr}.` : 'This ban is permanent.'}`);
            await interaction.reply({
                content: `Successfully **banned** ${target.username}. ${durationMs ? `They will be unbanned in ${timeStr}` : 'This ban is permanent'} 💖`,
            });
            await interaction.guild.members.ban(target.id, { reason });

            if (durationMs) {
                setTimeout(async () => {
                    try {
                        await interaction.guild.members.unban(target.id, 'Temporary ban expired');
                        console.log(`Unbanned ${target.tag} after temporary ban.`);
                    } catch (err) {
                        console.error(`Failed to unban ${target.tag}:`, err);
                    }
                }, durationMs);
            }
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'Failed to ban the user. Do I have permissions?', ephemeral: true });
        }
    }
};
