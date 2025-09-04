const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ModNote = require('../../schemas/moderation/notes');
const { nanoid } = require('nanoid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notes')
        .setDescription('Manage moderator notes')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add a note to a user. Note: you can only add up to 3 per user.')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
                .addStringOption(opt => opt.setName('note').setDescription('Note content').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View notes for a user')
                .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove a note by ID')
                .addStringOption(opt => opt.setName('note_id').setDescription('Note ID').setRequired(true).setAutocomplete(true)))
        .addSubcommand(sub =>
            sub
                .setName('purge')
                .setDescription('Purge all notes for a user')
                .addUserOption(opt => opt.setName('target').setDescription('The user whose notes to purge').setRequired(true))),


    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        if (sub === 'add') {
            const user = interaction.options.getUser('user');
            const noteContent = interaction.options.getString('note');
            const modId = interaction.user.id;

            let doc = await ModNote.findOne({ guildId, userId: user.id });

            if (doc && doc.notes.length >= 3) {
                return interaction.reply({
                    content: `**${user.tag}** already has 3 notes. Use \`/notes remove\` or \`/notes purge\` first.`,
                    ephemeral: true,
                });
            }

            const newNote = {
                noteId: nanoid(5),
                content: noteContent,
                moderatorId: modId,
                timestamp: new Date(),
            };

            if (!doc) {
                doc = new ModNote({
                    guildId,
                    userId: user.id,
                    notes: [newNote],
                });
            } else {
                doc.notes.push(newNote);
            }

            await doc.save();
            return interaction.reply({ content: `📝 Note added to **${user.tag}**`, ephemeral: true });

        } else if (sub === 'view') {
            const user = interaction.options.getUser('user');
            const doc = await ModNote.findOne({ guildId, userId: user.id });

            if (!doc || doc.notes.length === 0)
                return interaction.reply({ content: 'No notes found for that user.', ephemeral: true });

            const lines = doc.notes.map(note => `• \`${note.noteId}\` by <@${note.moderatorId}>\n🔸<t:${Math.floor(note.timestamp / 1000)}:f> ${note.content}`).join('\n\n')
            const content = `## 📝 Notes on ${user.tag}:\n${lines}`

            return interaction.reply({ content: content, allowMentions: false, ephemeral: true });

        } else if (sub === 'remove') {
            const noteId = interaction.options.getString('note_id');

            const doc = await ModNote.findOne({ guildId, 'notes.noteId': noteId });
            if (!doc)
                return interaction.reply({ content: 'Note not found.', ephemeral: true });

            doc.notes = doc.notes.filter(n => n.noteId !== noteId);
            await doc.save();

            return interaction.reply({ content: '🗑️ Note removed.', ephemeral: true });

        } else if (sub === 'purge') {
            const target = interaction.options.getUser('target');
            const doc = await ModNote.findOne({ guildId: interaction.guild.id, userId: target.id });

            if (!doc || doc.notes.length === 0) {
                return interaction.reply({ content: `No notes found for ${target.tag}.`, ephemeral: true });
            }

            await ModNote.deleteOne({ guildId: interaction.guild.id, userId: target.id });

            return await interaction.reply({
                content: `🧹 Successfully purged **${doc.notes.length}** notes for ${target.tag}.`,
                ephemeral: true
            });
        }
    }
};

module.exports.autocomplete = async (interaction) => {
    const focused = interaction.options.getFocused();
    const sub = interaction.options.getSubcommand(false);
    if (sub !== 'remove') return;

    const guildId = interaction.guild.id;

    const docs = await ModNote.find({ guildId }).limit(10);

    const allNotes = docs.flatMap(doc =>
        doc.notes.map(note => ({
            name: `${note.noteId} (${note.content.slice(0, 30)}${note.content.length > 30 ? '...' : ''})`,
            value: note.noteId,
        }))
    );

    const filtered = allNotes.filter(n => n.name.toLowerCase().includes(focused.toLowerCase()));

    await interaction.respond(filtered.slice(0, 25));
};