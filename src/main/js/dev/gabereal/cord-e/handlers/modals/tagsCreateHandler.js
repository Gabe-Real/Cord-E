const Tag = require('../../schemas/tags/tags');

module.exports = {
    customId: 'tag:create',

    async execute(interaction) {
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
};