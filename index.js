const { Client, Collection, Events, GatewayIntentBits, ActivityType, MessageFlags, Partials, EmbedBuilder, roleMention, ChannelType, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const WelcomeConfig = require('./src/main/js/dev/gabereal/cord-e/schemas/welcome/welcome');
const autocompleteHandler = require('./src/main/js/dev/gabereal/cord-e/handlers/events/autocompleteHandler');
const cordboard = require('./src/main/js/dev/gabereal/cord-e/commands/cordboard/cordboard');
const antiReplyHandler = require('./src/main/js/dev/gabereal/cord-e/handlers/commands/replyping');
const bannedReactionsHandler = require('./src/main/js/dev/gabereal/cord-e/handlers/events/bannedreact');
const { handleQuickTag } = require('./src/main/js/dev/gabereal/cord-e/handlers/commands/quickTags');


// ENVIRONMENT VARIABLES
require('dotenv').config();
const token = process.env.TOKEN;
const mongoUri = process.env.MONGODB_URI;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

mongoose.connect(mongoUri, {
}).then(() => {
    console.log('MongoDB connected.');
}).catch(console.error);

client.on('guildMemberAdd', async member => {
    const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
    if (!config?.enabled) return;

    const channel = member.guild.channels.cache.get(config.channelId);
    if (!channel?.isTextBased()) return;

    const welcomeMessage = config.message
        .replace(/{user}/g, member.user.username)
        .replace(/{id}/g, member.id)
        .replace(/{mention}/g, `<@${member.id}>`);

    channel.send(welcomeMessage);
});

client.on('guildMemberRemove', async member => {
    const config = await WelcomeConfig.findOne({ guildId: member.guild.id });
    if (!config?.leaveEnabled) return;

    const channel = member.guild.channels.cache.get(config.leaveChannel);
    if (!channel?.isTextBased()) return;

    const leaveMessage = config.leaveMessage
        .replace(/{user}/g, member.user.username)
        .replace(/{id}/g, member.id)
        .replace(/{mention}/g, `<@${member.id}>`);

    channel.send(leaveMessage);
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (cordboard.onReaction) {
        await cordboard.onReaction(reaction, user, client);
    }

    await bannedReactionsHandler.execute(reaction, user);
});


client.commands = new Collection();
client.modals = new Collection();

const foldersPath = path.join(__dirname, 'src/main/js/dev/gabereal/cord-e/commands');
const commandFolders = fs.readdirSync(foldersPath);
const modalFiles = fs.readdirSync(path.join(__dirname, 'src/main/js/dev/gabereal/cord-e/handlers/modals')).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'src/main/js/dev/gabereal/cord-e/handlers/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

for (const file of modalFiles) {
    const modal = require(`./src/main/js/dev/gabereal/cord-e/handlers/modals/${file}`);
    client.modals.set(modal.customId, modal);
}

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.name) {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error whilst executing this command, if you think this is a bug please DM gabe_real10.',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: 'There was an error whilst executing this command, if you think this is a bug please DM gabe_real10.',
                    ephemeral: true
                });
            }
        }
        return;
    }

    if (interaction.isModalSubmit()) {
        let modal = client.modals.get(interaction.customId);

        if (!modal) {
            for (const [key, handler] of client.modals) {
                if (interaction.customId.startsWith(key)) {
                    modal = handler;
                    break;
                }
            }
        }

        if (!modal) return;

        try {
            await modal.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({
                content: 'There was an error whilst executing this command, if you think this is a bug please DM gabe_real10.',
                ephemeral: true
            });
        }
    }

    if (interaction.isAutocomplete()) {
        await autocompleteHandler.handle(interaction, client);
    }


    if (interaction.isButton()) {
        const [prefix, roleId] = interaction.customId.split(':');
        if (prefix !== 'rr') return;

        const member = interaction.member;
        if (!member) return;

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return interaction.reply({content: 'Role not found.', ephemeral: true});

        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            return interaction.reply({
                content: `Removed role **${role.name}**`,
                ephemeral: true
            });
        } else {
            await member.roles.add(roleId);
            return interaction.reply({
                content: `Added role **${role.name}**`,
                ephemeral: true
            });
        }
    }

})

client.on('messageCreate', async message => {
    await antiReplyHandler.handle(client, message);
    await handleQuickTag(message)
});

client.once(Events.ClientReady, async c => {
    console.log(`Logged in as ${c.user.username}`);
    client.user.setPresence({
        status: 'online',
        activities: [
            { name: 'Sabrina Carpenter', type: ActivityType.Listening },
        ]
    });


})

client.login(token);

module.exports = client;
