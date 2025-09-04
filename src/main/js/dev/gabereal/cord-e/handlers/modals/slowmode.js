module.exports = {
    customId: 'set_slowmode_modal',

    async execute(interaction) {
        const input = interaction.fields.getTextInputValue('slowmode_time_input');
        const channel = interaction.channel;

        // Convert input to seconds
        let seconds = 0;
        const match = input.match(/^(\d+)(s|m|h)?$/i);

        if (!match) {
            return interaction.reply({
                content: 'Invalid time format. Use values like 10s, 5m, 1h, or 0.',
                ephemeral: true
            });
        }

        const value = parseInt(match[1]);
        const unit = match[2]?.toLowerCase() || 's';

        if (unit === 's') seconds = value;
        else if (unit === 'm') seconds = value * 60;
        else if (unit === 'h') seconds = value * 3600;

        if (seconds > 21600) {
            return interaction.reply({
                content: 'The maximum slowmode is 6 hours (21600 seconds).',
                ephemeral: true
            });
        }

        try {
            await channel.setRateLimitPerUser(seconds, `Set by ${interaction.user.tag}`);
            await interaction.reply({
                content: `📝 Successfully set slowmode to **${seconds === 0 ? 'off' : `${seconds} seconds`}**.`,
                ephemeral: false
            });
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: 'Failed to set slowmode. Do I have permission?',
                ephemeral: true
            });
        }
    }
};
