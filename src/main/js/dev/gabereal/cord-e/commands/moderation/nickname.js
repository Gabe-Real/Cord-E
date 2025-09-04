const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
    InteractionType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Change the nickname of a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to change the nickname of')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        if (interaction.type === InteractionType.ApplicationCommand) {
            const member = interaction.options.getMember('user');
            if (!member) {
                return interaction.reply({ content: 'Could not find that user in this server.', ephemeral: true });
            }
            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return interaction.reply({ content: 'I need Manage Nicknames permission to do that.', ephemeral: true });
            }
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return interaction.reply({ content: 'You need Manage Nicknames permission to do that.', ephemeral: true });
            }

            const currentNickname = member.nickname ?? member.displayName;
            const modal = new ModalBuilder()
                .setCustomId(`nicknameModal_${member.id}`)
                .setTitle(`Change nickname for ${member.user.tag}`);

            const nicknameInput = new TextInputBuilder()
                .setCustomId('newNickname')
                .setLabel('New nickname (leave blank to reset)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(32)
                .setPlaceholder('Enter new nickname')
                .setValue(currentNickname);

            const row = new ActionRowBuilder().addComponents(nicknameInput);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }
    },

    async modalSubmit(interaction) {
        if (!interaction.customId.startsWith('nicknameModal_')) return;

        const memberId = interaction.customId.split('_')[1];
        const newNickname = interaction.fields.getTextInputValue('newNickname').trim();

        const member = await interaction.guild.members.fetch(memberId).catch(() => null);
        if (!member) {
            return interaction.reply({ content: 'Member not found.', ephemeral: true });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: 'I lack Manage Nicknames permission.', ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return interaction.reply({ content: 'You lack Manage Nicknames permission.', ephemeral: true });
        }

        try {
            if (newNickname === '') {
                await member.setNickname(null, `Nickname reset by ${interaction.user.tag}`);
                await interaction.reply({ content: `🗞️ Nickname reset for ${member.user.tag}`, ephemeral: true });
            } else {
                await member.setNickname(newNickname, `Nickname changed by ${interaction.user.tag}`);
                await interaction.reply({ content: `✏️ Nickname changed to **${newNickname}** for ${member.user.tag}`, ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `🔎 Failed to change nickname: ${error.message}. Check permissions or make sure Cozy's role is above the member's.`, ephemeral: true });
        }
    }
};
