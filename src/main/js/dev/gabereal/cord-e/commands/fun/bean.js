const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bean')
        .setDescription('Bean someone for their *terrible* actions.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to bean')
                .setRequired(true)
        )
        .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the bean')
            .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const moderator = interaction.user;

        const embed = new EmbedBuilder()
            .setTitle('User Beaned')
            .setDescription(`Beaned <@${user.id}>\n**Reason**\n${reason}\n\n**"Responsible" "Moderator"**\n<@${moderator.id}>`);

        await interaction.reply({ embeds: [embed] });
    }
}