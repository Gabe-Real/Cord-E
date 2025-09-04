const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Warn = require('../../schemas/moderation/warn');
const WarnConfig = require('../../schemas/moderation/warnConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn users or manage warning settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('user')
                .setDescription('Warn a user')
                .addUserOption(o => o.setName('target').setDescription('User to warn').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('Reason for warning').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('Configure warning system')
                .addIntegerOption(o => o.setName('threshold').setDescription('Warnings until action'))
                .addStringOption(o =>
                    o.setName('action')
                        .setDescription('Action at threshold')
                        .addChoices(
                            { name: 'Kick', value: 'kick' },
                            { name: 'Mute', value: 'mute' },
                            { name: 'Ban', value: 'ban' },
                            { name: 'None', value: 'none' }
                        )
                )
        )
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View warnings for a user')
                .addUserOption(o => o.setName('target').setDescription('User to check').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear all warnings for a user')
                .addUserOption(o => o.setName('target').setDescription('User to clear').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'config') {
            const msg = interaction.options.getString('dm_message');
            const threshold = interaction.options.getInteger('threshold');
            const action = interaction.options.getString('action');

            let config = await WarnConfig.findOne({ guildId });
            if (!config) config = new WarnConfig({ guildId });

            if (msg) config.dmMessage = msg;
            if (threshold !== null) config.warningThreshold = threshold;
            if (action) config.action = action;

            await config.save();

            return interaction.reply({
                content: `Warn config updated:\nThreshold: ${config.warningThreshold}\nAction: ${config.action}`,
                ephemeral: true
            });
        }

        if (sub === 'user') {
            const user = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason');
            const moderatorId = interaction.user.id;

            let record = await Warn.findOne({ guildId, userId: user.id });
            if (!record) record = new Warn({ guildId, userId: user.id, warnings: [] });

            record.warnings.push({ reason, moderatorId });
            await record.save();

            const config = await WarnConfig.findOne({ guildId }) || {
                warningThreshold: 3,
                action: 'kick'
            };



            try {
                await user.send(`You were warned in **${interaction.guild.name}** for ${reason.toLowerCase()}`);
            } catch {
                console.warn(`${user} could not be dmd`)
            }

            if (record.warnings.length >= config.warningThreshold) {
                const member = await interaction.guild.members.fetch(user.id).catch(() => null);

                if (member) {
                    switch (config.action) {
                        case 'kick':
                            await member.send(`You were kicked from **${interaction.guild.name}** for reaching the warning threshold`);
                            await member.kick(`Reached ${config.warningThreshold} warnings`);
                            break;
                        case 'ban':
                            await member.send(`You were banned from **${interaction.guild.name}** for reaching the warning threshold`);
                            await member.ban({reason: `Reached ${config.warningThreshold} warnings`});
                            break;
                        case 'mute':
                            await member.send(`You were muted in **${interaction.guild.name}** for reaching the warning threshold`);
                            await member.timeout?.(7 * 24 * 60 * 60 * 1000, 'Reached warning threshold');
                            break;
                    }
                }

                record.warnings = [];
                await record.save();
            }

            return interaction.reply({
                content: `Successfully **warned** ${user.username}. 💖`,
            });
        }

        if (sub === 'view') {
            const user = interaction.options.getUser('target');
            const record = await Warn.findOne({ guildId, userId: user.id });

            if (!record || record.warnings.length === 0) {
                return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
            }

            const list = record.warnings
                .map((warn, i) =>
                    `<@${warn.moderatorId}> at ${new Date(warn.date).toLocaleDateString()}\n> **${i + 1}.** ${warn.reason}`
                )
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`📄 Warnings for ${user.tag}`)
                .setDescription(list)
                .setColor('Yellow');

            const content = `## ⚠️ ${user.tag}'s warnings:\n${list}`


            return interaction.reply({ content: content, ephemeral: false });
        }

        if (sub === 'clear') {
            const user = interaction.options.getUser('target');
            const result = await Warn.findOneAndDelete({ guildId, userId: user.id });

            if (!result) {
                return interaction.reply({ content: `No warnings found for ${user.tag}.`, ephemeral: true });
            }

            await interaction.reply({ content: `🧹 Cleared all warnings for ${user.tag}.`, ephemeral: true });
        }
    }};

