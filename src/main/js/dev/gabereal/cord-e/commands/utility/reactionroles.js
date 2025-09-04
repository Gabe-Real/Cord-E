const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ReactionRole = require('../../schemas/reactionroles/reactionroles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('Manage reaction role messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a reaction role message')
                .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(true))
                .addStringOption(opt => opt.setName('title').setDescription('Title of the message').setRequired(true))
                .addStringOption(opt => opt.setName('json').setDescription('JSON of roles/buttons').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a reaction role message')
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID to delete').setRequired(true))
        )
        .addSubcommand(sub =>
        sub.setName('how-to')
            .setDescription('How to reaction roles')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const channel = interaction.options.getChannel('channel');
            const title = interaction.options.getString('title');
            const json = interaction.options.getString('json');

            let parsed;
            try {
                parsed = JSON.parse(json);
            } catch {
                return interaction.reply({ content: 'Invalid JSON format.', ephemeral: true });
            }

            const buttons = parsed.map(role =>
                new ButtonBuilder()
                    .setCustomId(`rr:${role.roleId}`)
                    .setLabel(role.label)
                    .setEmoji(role.emoji || null)
                    .setStyle(ButtonStyle[role.style?.toUpperCase()] || ButtonStyle.Secondary)
            );

            const rows = [];
            for (let i = 0; i < buttons.length; i += 5) {
                rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
            }

            const msg = await channel.send({ content: `**${title}**`, components: rows });

            await ReactionRole.create({
                guildId: interaction.guild.id,
                messageId: msg.id,
                channelId: channel.id,
                roles: parsed
            });

            return interaction.reply({ content: 'Reaction role message created.', ephemeral: true });
        }

        if (sub === 'delete') {
            const messageId = interaction.options.getString('message_id');
            const data = await ReactionRole.findOne({ messageId });

            if (!data) return interaction.reply({ content: 'Message not found in the database.', ephemeral: true });

            try {
                const ch = await interaction.guild.channels.fetch(data.channelId);
                const msg = await ch.messages.fetch(data.messageId);
                await msg.delete();
            } catch {}

            await data.deleteOne();
            return interaction.reply({ content: 'Reaction role message deleted.', ephemeral: true });
        }

        if (sub === 'how-to') {
            return interaction.reply({ content: '## How to use reaction roles\n' +
                    'Here is an example of a correct JSON file that **would** work\n' +
                    '```[\n' +
                    '  { "label": "Java", "roleId": "123456789012345678", "emoji": ":coffee:", "style": "success" },\n' +
                    '  { "label": "Python", "roleId": "987654321098765432", "emoji": ":snake:", "style": "primary" }\n' +
                    ']```\n' +
                    'Label: Anything you like, this will display as a title to the button.\n' +
                    'roleId: The Id of the role you would like to give, please make sure the bot\'s role is above the role you ' +
                    'would like to give or else the bot will crash\n' +
                    'emoji: The emoji is a little addition to the title in which it is the emoji that displays next to it.\n' +
                    'style: You can pretty much leave the style.', ephemeral: true });
        }
    }
};
