const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const StarboardConfig = require('../../schemas/cordboard/cordboardConfig');
const StarboardPost = require('../../schemas/cordboard/cordboardPost');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cordboard')
        .setDescription('Configure the cordboard system')
        .addSubcommand(sub =>
            sub.setName('config')
                .setDescription('Configure cordboard settings')
                .addIntegerOption(opt =>
                    opt.setName('threshold')
                        .setDescription('Number of emojis needed before posting')
                        .setRequired(true))
                .addStringOption(opt =>
                    opt.setName('emoji')
                        .setDescription('Emoji to track (e.g. ☕)')
                        .setRequired(true))
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to send the messages')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'config') {
            const threshold = interaction.options.getInteger('threshold');
            const emoji = interaction.options.getString('emoji');
            const channel = interaction.options.getChannel('channel');

            await StarboardConfig.findOneAndUpdate(
                { guildId },
                { threshold, emoji, channelId: channel.id },
                { upsert: true }
            );

            await interaction.reply({ content: '📝 Cordboard configuration saved!', ephemeral: true });
        }
    },

    async onReaction(reaction, user, client) {
        if (user.bot) return;

        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        const guildId = reaction.message.guildId;
        const conf = await StarboardConfig.findOne({ guildId });
        if (!conf || reaction.emoji.name !== conf.emoji) return;

        const count = reaction.count;
        const threshold = conf.threshold;
        const starboardChannel = reaction.message.guild.channels.cache.get(conf.channelId);
        if (!starboardChannel) return;

        const attachment = reaction.message.attachments.find(att => att.contentType?.startsWith('image/'));
        const replied = reaction.message.reference ? await reaction.message.channel.messages.fetch(reaction.message.reference.messageId).catch(() => null) : null;

        const embed = new EmbedBuilder()
            .setColor('White')
            .setAuthor({ name: reaction.message.author.tag, iconURL: reaction.message.author.displayAvatarURL() })
            .setDescription(
                (replied ? `**Replying to ${replied.author.tag}:** ${replied.content}\n\n` : '') +
                (reaction.message.content || (attachment ? '*Attachment*' : '*No content*'))
            )
            .addFields({ name: 'Information', value: `${conf.emoji} ${count} in https://discord.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}`, inline: true })
            .setImage(attachment?.url ?? null)
            .setTimestamp()
            .setFooter({ text: `Message ID: ${reaction.message.id}` });

        const jumpButton = new ButtonBuilder()
            .setLabel('☕ Jump to Message')
            .setStyle(ButtonStyle.Link)
            .setURL(reaction.message.url);

        const row = new ActionRowBuilder().addComponents(jumpButton);

        if (count >= threshold) {
            const existing = await StarboardPost.findOne({ messageId: reaction.message.id });
            if (existing) {
                try {
                    const msg = await starboardChannel.messages.fetch(existing.starboardMsgId);
                    await msg.edit({ embeds: [embed], components: [row] });
                } catch (err) {
                    console.error('Failed to edit Cordboard message:', err);
                }
            } else {
                const sent = await starboardChannel.send({ embeds: [embed], components: [row] });
                await StarboardPost.create({
                    messageId: reaction.message.id,
                    starboardMsgId: sent.id,
                    originalChannelId: reaction.message.channel.id,
                    guildId
                });
            }
        }
    },
};
