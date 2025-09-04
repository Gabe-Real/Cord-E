const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const icon = 'https://github.com/QuiltMC/art/raw/master/emoji/lil-pineapple/rendered/lil-pineapple.png'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('modmsg')
        .setDescription('Send a message... but classy moderation style :)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),

    async execute(interaction) {
        const messageContent = interaction.options.getString('message');
        const user = interaction.user.username || interaction.user.tag;


        const embed = new EmbedBuilder()
            .setColor(0xe68675)
            .setAuthor({ name: user, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(messageContent)
            .setFooter({ text: 'Moderator message' });

        await interaction.reply({ content: 'Moderation message sent:', ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
        console.log(`[DEBUG] modmsg command executed by ${user.tag} in guild ${interaction.guild.id}. Message: "${messageContent}"`);
    }
}