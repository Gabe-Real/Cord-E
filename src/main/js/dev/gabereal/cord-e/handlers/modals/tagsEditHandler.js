const Tag = require('../../schemas/tags/tags');

module.exports = {
    customId: 'tag:edit:',

    async execute(interaction) {
        const id = interaction.customId;
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
};