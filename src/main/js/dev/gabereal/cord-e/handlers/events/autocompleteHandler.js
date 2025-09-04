module.exports = {
    async handle(interaction, client) {
        if (!interaction.isAutocomplete()) return;

        try {
            const command = client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            await command.autocomplete(interaction);
        } catch (err) {
            console.error('Autocomplete handler error:', err);
        }
    }
};
