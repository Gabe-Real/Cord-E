const {
    SlashCommandBuilder,
    ThumbnailBuilder,
    TextDisplayBuilder,
    ButtonBuilder,
    ButtonStyle,
    SectionBuilder,
    SeparatorBuilder,
} = require('discord.js');
const cheerio = require('cheerio');

function decodeHtmlEntities(str) {
    return cheerio.load('<div>' + str + '</div>')('div').text();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Various lookup utilities (thesaurus, definitions, steam ect...)')
        .addSubcommand(sub =>
            sub
                .setName('thesaurus')
                .setDescription('Get 3 synonyms and antonyms for a word.')
                .addStringOption(opt =>
                    opt
                        .setName('query')
                        .setDescription('The word to search for.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('definition')
                .setDescription('Look up the definition of a word.')
                .addStringOption(opt =>
                    opt
                        .setName('query')
                        .setDescription('The word you\'re looking for.')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('steam')
                .setDescription('Search for games on steam.')
                .addStringOption(opt =>
                    opt
                        .setName('query')
                        .setDescription('The name of the game to search for.')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        if (sub === 'thesaurus') {
            const word = interaction.options.getString('query');

            const replyComponents = [
                new TextDisplayBuilder().setContent(`🔍 Looking up synonyms and antonyms for **${word}**...`)
            ]
            await interaction.reply({
                components: replyComponents,
                flags: 1 << 15,
            });

            try {
                const [synonymsRes, antonymsRes] = await Promise.all([
                    fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=3`),
                    fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=3`),
                ]);
                const synonyms = await synonymsRes.json();
                const antonyms = await antonymsRes.json();

                const synonymList =
                    synonyms.length > 0
                        ? '### Synonyms:\n' + synonyms.map(w => `• ${w.word}`).join('\n')
                        : '';
                const antonymList =
                    antonyms.length > 0
                        ? '### Antonyms:\n' + antonyms.map(w => `• ${w.word}`).join('\n')
                        : '';


                const componentsResponse = [
                    new TextDisplayBuilder().setContent(`## 📚 Thesaurus results for: '${word}'`),
                    new SeparatorBuilder().setDivider(true),
                    new TextDisplayBuilder().setContent(`${synonymList}\n${antonymList}`),
                ];

                await interaction.editReply({components: componentsResponse, flags: 1 << 15});
            } catch (error) {
                console.error('Thesaurus API error:', error);

                const fallbackComponents = [
                    new TextDisplayBuilder().setContent('<:cross:1386317251413671986> An error occurred while fetching thesaurus data. Please try again later.')
                ]
                await interaction.editReply({
                    components: fallbackComponents,
                    flags: 1 << 15,
                });
            }
        } else if (sub === 'steam') {
            const query = interaction.options.getString('query');
            const searchingComponents = [
                new TextDisplayBuilder().setContent(`Searching Steam for **${query}**...`)
            ]
            await interaction.reply({
                components: searchingComponents,
                flags: 1 << 15
            });

            const searchRes = await fetch(
                `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&cc=US&l=en`
            );
            const searchData = await searchRes.json();

            if (!searchData.items || searchData.items.length === 0) {

                const nonFoundComponents = [
                    new TextDisplayBuilder().setContent(`<:cross:1386317251413671986> No games found on Steam for: \`${query}\`.`)
                ]
                return interaction.editReply({
                    components: nonFoundComponents,
                    flags: 1 << 15
                });
            }

            const results = searchData.items.slice(0, 5);
            let gamesList = '';
            for (const game of results) {
                const title = game.name;
                const price = game.price ? `$${(game.price.final / 100).toFixed(2)}` : 'Free or Unavailable';
                const platforms = Object.entries(game.platforms)
                    .filter(([_, supported]) => supported)
                    .map(([p]) => p[0].toUpperCase()).join(', ');

                gamesList += `• [${title}](<https://store.steampowered.com/app/${game.id}>) - ${price} (${platforms})\n`;
            }

            const componentsReply = [
                new TextDisplayBuilder().setContent(`## 🕹️ Steam results for: '${query}'\n`),
                new SeparatorBuilder().setDivider(true),
                new TextDisplayBuilder().setContent(gamesList)
            ];

            await interaction.editReply({
                components: componentsReply,
                flags: 1 << 15,
            });
        } else if (sub === 'definition') {
            const word = interaction.options.getString('query');
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;


            try {
                const response = await fetch(url);
                if (!response.ok) {
                    return interaction.reply({ content: `No definitions found for **${word}**.`, ephemeral: true });
                }

                const data = await response.json();
                const definitionData = data[0];


                let pronunciation = '';
                if (definitionData.phonetics && definitionData.phonetics.length) {
                    let pronunciationRaw = definitionData.phonetics.find(p => p.text)?.text || '';
                    pronunciation = pronunciationRaw.replace(/^[/\[]|[/\]]$/g, '');
                }
                if (!pronunciation && definitionData.phonetic) {
                    pronunciation = definitionData.phonetic.replace(/^[/\[]|[/\]]$/g, '');
                }

                const definitions = definitionData.meanings
                    .map(meaning => {
                        const defs = meaning.definitions
                            .map((def, index) => ` ${index + 1}. ${def.definition}`)
                            .join('\n');
                        return `### Word class: ${meaning.partOfSpeech}\n${defs}`;
                    })
                    .join('\n');


                const wordTitle =
                    pronunciation
                        ? `## 📚 Definition of the word: '${definitionData.word}  /  ${pronunciation}'`
                        : `## 📚 Definition of the word '${definitionData.word}'`;

                const components = [
                    new TextDisplayBuilder().setContent(wordTitle),
                    new SeparatorBuilder().setDivider(true),
                    new TextDisplayBuilder().setContent(definitions),
                ];

                await interaction.reply({ components: components, flags: 1 << 15 });

            } catch (err) {
                console.error(err);
                await interaction.reply({ content: 'There was an error fetching the definition. Please try again later.', ephemeral: true });
            }
        }
    },
};