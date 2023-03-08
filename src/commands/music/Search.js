const Command = require('../../structures/Command');
const { SelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Search extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            description: {
                content: 'To search song from spotify/soundcloud.',
                usage: 'search <song name>',
                examples: ['search despacito', 'search despacito']
            },
            args: true,
            category: 'music',
            voteReq: true,
            cooldown: 6,
            player: {
                voice: true,
                dj: false,
                active: false,
                djPerm: ['DeafenMembers'],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
            options: [
                {
                    name: 'song',
                    description: 'The song you want to search for.',
                    type: 3,
                    required: true,
                },
                {
                    name: 'engine',
                    description: 'The engine you want to search for.',
                    type: 3,
                    required: false,
                    choices: [
                        {
                            name: 'Spotify',
                            value: 'spotify'
                        },
                        {
                            name: 'Soundcloud',
                            value: 'soundcloud'
                        }
                    ]
                }
            ]
        })
    }

    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);
        let engine = interaction.options.getString('engine');
        switch (engine) {
            case 'spotify':
                engine = 'spotify';
                break;
            case 'soundcloud':
                engine = 'soundcloud';
                break;
            default:
                engine = 'spotify';
                break;
        }
        const query = interaction.options.getString("song");
        const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`Please provide a song name to search for.`)
        if(!query) return intReply(interaction, ({ embeds: [embed] }));
      
        if (!player) player = await client.player.createPlayer({
            guildId: interaction.guildId,
            textId: interaction.channelId,
            voiceId: interaction.member.voice.channelId,
            deaf: true,
            shardId: interaction.guild.shardId,
        });

        let s = await player.search(query, { requester: interaction.user, engine: engine });
        switch (s.type) {
            case 'PLAYLIST': {
                const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Playlists are not supported in search, please use the **play** command to play tracks from a playlist.`)
                return intReply(interaction, ({ embeds: [embed1] }));
            }
            case 'TRACK': {
                const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Tracks are not supported in search, please use the **play** command to play tracks.`)
                return intReply(interaction, ({ embeds: [embed1] }));
            }
            case 'SEARCH': {

                const results = s.tracks.slice(0, 10);
                let n = 0;
                const str = s.tracks.slice(0, 10).map(r => `**${++n}.** [${r.title}](${r.uri})`).join('\n');

                const selectMenuArray = [];
                for (let i = 0; i < results.length; i++) {
                    const track = results[i];
                    let label = `${i + 1}. ${track.title}`;
                    if (label.length > 100) label = label.substring(0, 97) + '...';
                    selectMenuArray.push({
                        label: label,
                        description: track.author,
                        value: i.toString(),
                    });
                }
                const selectMenuRow = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('SEARCH_SELECT_MENU')
                            .setPlaceholder('Nothing selected')
                            .setMinValues(1)
                            .setMaxValues(10)
                            .addOptions(selectMenuArray),
                    );
                const embed = client.embed()
                    .setAuthor({ name: 'Track selection'})
                    .setDescription(str)
                    .setFooter({ text: 'You have 30 seconds to make your selection via the dropdown menu.' })
                    .setColor(client.config.color);
                await intReply(interaction, { content: null, embeds: [embed], components: [selectMenuRow] }).then((message) => {
                    const toAdd = [];
                    let count = 0;
                    const selectMenuCollector = message.createMessageComponentCollector({
                        componentType: ComponentType.SelectMenu,
                        time: 30000,
                        filter: (i) => i.user.id === interaction.user.id,
                    });
                    selectMenuCollector.on('collect', async (interaction) => {
                        if (interaction.customId != 'SEARCH_SELECT_MENU') return;
                        if (interaction.user.id != interaction.user.id) return;
                        interaction.deferUpdate();
                        for (const value of interaction.values) {
                            toAdd.push(s.tracks[value]);
                            count++;
                        }
                        selectMenuCollector.on('end', async () => {
                            const embed3 = new EmbedBuilder()
                            .setColor(client.config.color)
                            .setDescription(`${this.client.config.emojis.error} This selection menu has expired`)
                           if(message) await message.edit({ embeds: [embed3], components: [] });
                        })
                        await player.queue.add(toAdd);
                        await updateQueue(client, player, interaction.guild);
                        if (!player.playing || !player.queue.current) player.play();
                        const { tracks, type, playlistName } = await player.search(query, { requester: interaction.user, engine: 'spotify' });
                        const embed2 = new EmbedBuilder()
                        .setColor(client.config.color)
                        .setDescription(`${client.config.emojis.success} Added ${count === 1 ? `[${s.tracks[interaction.values[0]].title.length > 50 ? s.tracks[interaction.values[0]].title.substring(0, 50) + "..." : s.tracks[interaction.values[0]].title}](${tracks[0].uri}) by ${await player.getArtist(this.client, tracks[0])} to the queue` : `**${count}** tracks to the queue.`}`)
                        await message.reply({ content: ``, embeds: [embed2], components: [] });

                    });
                    
                })
            }
        }
    }
}

