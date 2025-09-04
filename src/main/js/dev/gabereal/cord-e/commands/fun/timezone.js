// commands/utility/timezone.js

const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');

const countryTimezones = {
    "United States": "America/New_York",
    "Canada": "America/Toronto",
    "United Kingdom": "Europe/London",
    "Germany": "Europe/Berlin",
    "France": "Europe/Paris",
    "India": "Asia/Kolkata",
    "China": "Asia/Shanghai",
    "Japan": "Asia/Tokyo",
    "South Korea": "Asia/Seoul",
    "Australia": "Australia/Sydney",
    "New Zealand": "Pacific/Auckland",
    "Brazil": "America/Sao_Paulo",
    "Mexico": "America/Mexico_City",
    "Russia": "Europe/Moscow",
    "South Africa": "Africa/Johannesburg",
    // "Nigeria": "Africa/Lagos",
    // "Indonesia": "Asia/Jakarta",
    // "Philippines": "Asia/Manila",
    // "Pakistan": "Asia/Karachi",
    "Argentina": "America/Argentina/Buenos_Aires",
    "Egypt": "Africa/Cairo",
    "Turkey": "Europe/Istanbul",
    "Italy": "Europe/Rome",
    "Spain": "Europe/Madrid",
    "Thailand": "Asia/Bangkok",
    // "Vietnam": "Asia/Ho_Chi_Minh",
    "Poland": "Europe/Warsaw",
    "Sweden": "Europe/Stockholm",
    "Netherlands": "Europe/Amsterdam",
    "Norway": "Europe/Oslo"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Get the current time in a specified country')
        .addStringOption(option =>
            option
                .setName('country')
                .setDescription('Choose a country')
                .setRequired(true)
                .addChoices(...Object.keys(countryTimezones).map(country => ({
                    name: country,
                    value: country
                })))
        ),

    async execute(interaction) {
        const country = interaction.options.getString('country');
        const tz = countryTimezones[country];

        if (!tz) {
            return interaction.reply({ content: 'Timezone not found for that country.', ephemeral: true });
        }

        const day = moment().tz(tz).format('dddd');
        const date = moment().tz(tz).format('MMMM Do YYYY');
        const time = moment().tz(tz).format('HH:mm:ss');
        const timezone = moment().tz(tz).format('z');

        return interaction.reply({
            content: `🕒 The current timezone in **${country}** (${tz}) is:\n> Day: **${day}**\n> Date: **${date}**\n> Time: **${time}**\n> Timezone: **${timezone}**`,
        });
    }
};
