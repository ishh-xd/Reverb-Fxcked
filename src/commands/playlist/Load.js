const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Load extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-load',
            description: {
                content: 'To load a playlist',
                usage: 'load <playlist name>',
                examples: ['load my playlist']
            },
            voteReq: true,
            category: 'playlist',
            cooldown: 6,
            player: {
                voice: true,
                dj: false,
                active: false,
                djPerm: ["DeafenMembers"],
            },
            permissions: {
                dev: false,
                client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
                user: [],
            },
            options: [
                {
                    name: "all",
                    description: "To load all the songs from your playlist.",
                    type: 1,
                    options: [
                        {
                            name: 'name',
                            type: 3,
                            required: true,
                            description: 'The playlist\'s name.',
                            max_length: 20,
                            autocomplete: true,
                        }
                    ]
                },

                {
                    name: "track",
                    description: "To load a track from your playlist.",
                    type: 1,
                    options: [
                        {
                            name: 'name',
                            type: 3,
                            required: true,
                            description: 'The playlist\'s name.',
                            max_length: 20,
                            autocomplete: true,
                        },
                        {
                            name: "number",
                            description: "The track number.",
                            type: 10,
                            required: true,
                        }
                    ]

                }
            ]
        });
    }
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        const name = interaction.options.getString('name');
        const playlistName = name.replace(/_/g, ' ');
        let data = await db.findOne({ _id: interaction.user.id, playlistName: playlistName });
        const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have a any playlist data. \nUsage: ${client.config.cmdId.plc}  \`<playlist name>.`)
        if (!data) return intReply(interaction, ({ embeds: [embed] })); 
        let player = await client.player.players.get(interaction.guildId);

        const subCommand = interaction.options.data[0].name;
        if (subCommand === "all") {
            const embed1 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`Successfully added **${data.playlist.length}** tracks from your playlist **${data.playlistName}** to the queue`)
            await intReply(interaction, { fetchReply: true,   embeds: [embed1] });
            const embed2 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have any playlist data. \nUsage: ${client.config.cmdId.plc}  \`<playlist name>.`)
            if (!data) return intReply(interaction, ({ embeds: [embed2] }));
            const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have any songs in your playlist.`)
            if (data.playlist.length <= 0 || data.playlist === null) return intReply(interaction, ({ embeds: [embed3] }));
            const embed4 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} You must be in the same voice channel as the bot to load a playlist.`)
            if (player && player.voiceChannel !== interaction.member.voice.channelId) return intReply(interaction, ({ embeds: [embed4] }));

            if (!player) player = await client.player.createPlayer({
                guildId: interaction.guildId,
                textId: interaction.channelId,
                voiceId: interaction.member.voice.channelId,
                deaf: true,
                shardId: interaction.guild.shardId,
            });
            let count = 0;
            for await (const track of data.playlist) {
                let s = await player.search(track.uri ? track.uri : track.title, { requester: interaction.user});
                if (s.type === "TRACK") {
                    if (player) player.queue.add(s.tracks[0]);
                    if (player && !player.playing && !player.paused && !player.queue.length) await player.play();
                    count++;
                } else if (s.type === "SEARCH") {
                    if (player) player.queue.add(s.tracks[0]);
                    if (player && !player.playing && !player.paused && !player.queue.length) await player.play();
                    count++;
                };
            }
            if (player && !player.queue.current) player.destroy();
            const embed5 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Couldn't add any tracks from your playlist **${playlistName}** to the queue.`)
            if (count <= 0) return intReply(interaction, ({ embeds: [embed5] }));
            await updteQueue(client, player, interaction.guild);
            const embed6 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully added ${count} track(s) from your playlist **${playlistName}** to the queue.`)
            return await intReply(interaction, ({ embeds: [embed6] }));
        } else if (subCommand === "track") {
            const embed7 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.typing} Adding playlist (This might take a few seconds.)...`)
            await intReply(ianteraction, { fetchReply: true, embeds: [embed7] });
            let trackNumber = interaction.options.getNumber("number");
            const embed8 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} You don't have any songs in your playlist.`)
            if (data.playlist.length <= 0 || data.playlist === null) return intReply(interaction, ({ embeds: [embed8] }));
            const embed9 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} The track number you provided is invalid.`)
            if (trackNumber > data.playlist.length) return intReply(interaction, ({ embeds: [embed9] }));
            const embed10 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} The track number you provided is invalid.`)
            if (trackNumber <= 0) return intReply(interaction, ({ embeds: [embed10] }));
            let thetrackNum = Number(trackNumber) - 1;
            let track = data.playlist[thetrackNum];
            const embed11 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You must be in the same voice channel as the bot to load a playlist.`)
            if (player && player.voiceChannel !== interaction.member.voice.channelId) return intReply(interaction, ({ embeds: [embed11] }));
            if (!player) player = client.player.createPlayer({
                guildId: interaction.guildId,
                textId: interaction.channelId,
                voiceId: interaction.member.voice.channelId,
                deaf: true,
                shardId: interaction.guild.shardId,
            });
            let s = await player.search(track.uri ? track.uri : track.title,{ requester: interaction.user});
            if (s.type === "TRACK") {
                if (player) player.queue.add(s.tracks[0]);
                await updateQueue(client, player, interaction.guild);
                const embed12 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully added \`${s.tracks[0].title}\` to the queue.`)
                await intReply(interaction, ({ embeds: [embed12] }));

                if (player && !player.playing && !player.paused && !player.queue.length) await player.play();
            } else if (s.type === "SEARCH") {
                if (player) player.queue.add(s.tracks[0]);
                await updateQueue(client, player, interaction.guild);
                const embed13 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully added \`${s.tracks[0].title}\` to the queue.`)
                await intReply(interaction, ({ embeds: [embed13] }));
                if (player && !player.playing && !player.paused && !player.queue.length) await player.play();
            };
        }
    }
}

