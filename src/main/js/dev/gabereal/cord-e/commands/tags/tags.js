const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits,} = require('discord.js');
const Tag = require('../../schemas/tags/tags');
const QuickPrefix = require('../../schemas/tags/quickTagsSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tags')
        .setDescription('Manage or view tags')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(cmd =>
            cmd.setName('create').setDescription('Create a new tag')
        )
        .addSubcommand(cmd =>
            cmd.setName('edit')
                .setDescription('Edit an existing tag')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Tag name to edit')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(cmd =>
            cmd.setName('delete')
                .setDescription('Delete a tag')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Tag name to delete')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(cmd =>
            cmd.setName('list')
                .setDescription('List all tags in this server')
        )
        .addSubcommand(cmd =>
            cmd.setName('show')
                .setDescription('Show a tag')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Tag name to display')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(cmd =>
            cmd.setName('quick')
                .setDescription('Configure the quick tag prefix')
                .addStringOption(opt =>
                    opt.setName('prefix')
                        .setDescription('Prefix to trigger quick tags (e.g. ! or .)')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'create') {
            const modal = new ModalBuilder()
                .setCustomId('tag:create')
                .setTitle('Create a Tag');

            const nameInput = new TextInputBuilder()
                .setCustomId('tag_name')
                .setLabel('Tag Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const contentInput = new TextInputBuilder()
                .setCustomId('tag_content')
                .setLabel('Tag Content')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(contentInput)
            );

            return interaction.showModal(modal);
        }

        if (sub === 'quick') {
            const prefix = interaction.options.getString('prefix');
            const guildId = interaction.guild.id;

            if (prefix.length > 3) {
                return interaction.reply({ content: 'Prefix too long. Must be 3 characters or fewer.', ephemeral: true });
            }

            await QuickPrefix.findOneAndUpdate(
                { guildId },
                { prefix },
                { upsert: true, new: true }
            );

            return interaction.reply({ content: `Quick tag prefix set to \`${prefix}\``, ephemeral: true });
        }

        if (sub === 'edit') {
            const name = interaction.options.getString('name').toLowerCase();
            const tag = await Tag.findOne({ guildId: interaction.guild.id, name });

            if (!tag) {
                return interaction.reply({ content: `Tag \`${name}\` not found.`, ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId(`tag:edit:${name}`)
                .setTitle(`Edit Tag: ${name}`);

            const contentInput = new TextInputBuilder()
                .setCustomId('tag_content')
                .setLabel('New Tag Content')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setValue(tag.content.slice(0, 4000));

            modal.addComponents(new ActionRowBuilder().addComponents(contentInput));
            return interaction.showModal(modal);
        }

        if (sub === 'delete') {
            const name = interaction.options.getString('name').toLowerCase();
            const result = await Tag.deleteOne({ guildId: interaction.guild.id, name });

            if (result.deletedCount === 0) {
                return interaction.reply({ content: `Tag \`${name}\` not found.`, ephemeral: true });
            }

            return interaction.reply({ content: `🗑️ Tag \`${name}\` deleted.`, ephemeral: true });
        }

        if (sub === 'list') {
            const tags = await Tag.find({ guildId: interaction.guild.id });

            const createButton = new ButtonBuilder()
                .setCustomId('tag:create:button')
                .setLabel('Create a new tag')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Secondary);

            if (!tags.length) {
                return interaction.reply({ content: '## 🍃 No tags in this server yet...\n\-\# lonely yes, very sad very, nono tag', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🏷️ Tags')
                .setDescription(tags.map(t => `• \`${t.name}\``).join('\n'))
                .setFooter({ text: `${tags.length} total tag(s)` });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'show') {
            const name = interaction.options.getString('name').toLowerCase();
            const tag = await Tag.findOne({ guildId: interaction.guild.id, name });

            if (!tag) {
                return interaction.reply({ content: `Tag \`${name}\` not found.`, ephemeral: true });
            }

            return interaction.reply({ content: tag.content });
        }
    },

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const guildId = interaction.guild.id;

        const tags = await Tag.find({ guildId });

        const filtered = tags
            .filter(tag => tag.name.toLowerCase().includes(focused.toLowerCase()))
            .slice(0, 25)
            .map(tag => ({
                name: tag.name,
                value: tag.name,
            }));

        await interaction.respond(filtered);
    },

    async modalSubmit(interaction) {
        const id = interaction.customId;

        if (id === 'tag:create') {
            const name = interaction.fields.getTextInputValue('tag_name').trim().toLowerCase();
            const content = interaction.fields.getTextInputValue('tag_content');

            const exists = await Tag.findOne({ guildId: interaction.guild.id, name });
            if (exists) {
                return interaction.reply({ content: `⚠️ Tag \`${name}\` already exists.`, ephemeral: true });
            }

            await Tag.create({
                guildId: interaction.guild.id,
                name,
                content,
                createdBy: interaction.user.id
            });

            return interaction.reply({ content: `📌 Tag \`${name}\` created!`, ephemeral: true });
        }

        if (id.startsWith('tag:edit:')) {
            const name = id.split(':')[2];
            const content = interaction.fields.getTextInputValue('tag_content');

            const tag = await Tag.findOneAndUpdate(
                { guildId: interaction.guild.id, name },
                { content },
                { new: true }
            );

            if (!tag) {
                return interaction.reply({ content: `Tag \`${name}\` not found.`, ephemeral: true });
            }

            return interaction.reply({ content: `✏️ Tag \`${name}\` updated.`, ephemeral: true });
        }
    }
};
