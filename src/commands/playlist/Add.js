const Command = require('../../structures/Command');
const db = require("../../schemas/playlists");
const { intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Add extends Command {
    constructor(client) {
        super(client, {
            name: 'pl-add',
            description: {
                content: 'To add a song into a playlist.',
                usage: 'add <playlist name> <search query/link>',
                examples: ['add my playlist https://open.spotify.com/playlist/37i9dQZF1DXaXB8fQg7xif']
            },
            voteReq: true,
            category: 'playlist',
            cooldown: 6,
            player: {
                voice: false,
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
                    name: 'name',
                    type: 3,
                    required: true,
                    description: 'The playlist\'s name.',
                    max_length: 20,
                    autocomplete: true,
                },
                {
                    name: 'song',
                    type: 3,
                    required: true,
                    description: 'The song\'s search query/link.',
                }
            ],
        });
    }
    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        const name = interaction.options.getString('name');
        const song = interaction.options.getString('song');
        const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Please specify a search query or link.\nUsage:  ${client.config.cmdId.pla} \`<playlist name> <search query/link>\``)
        if (!song && !interaction.attachments) return intReply(interaction, ({ embeds: [embed] }));
        const embed1 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} Playlist name must be less than ${this.options[0].max_length} characters!`)
        if (name.length > this.options[0].max_length) return intReply(interaction, ({ embeds: [embed1] }));

        const playlistName = name.replace(/_/g, ' ');
        const query = song ? song : interaction.attachments[0].url;
        if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(query)) {
            const embed2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`YouTube is not a supported platform for steaming music.`)
            return intReply(interaction, ({ embeds: [embed2] }));
        }
        let data = await db.findOne({ _id: interaction.user.id });
        const embed3 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You don't have any playlist data. \nUsage: ${client.config.cmdId.plc} \`<playlist name>\`.`)
        if (!data) return intReply(interaction, ({ embeds: [embed3] }));
        const embed4 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} You can't have more than 200 songs in a playlist.`)
        if (data.playlist.length >= 200) return await intReply(interaction, ({ embeds: [embed4] }));

        let player = await client.player.players.get(interaction.guildId);
        if (!player) player = await client.player.createPlayer({
            guildId: interaction.guildId,
            textId: interaction.channelId,
        });

        let s = await player.search(query, { requester: interaction.user, engine: 'spotify' });
        if (s.type === "PLAYLIST") {
            for (const track of s.tracks) {
                if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(track.uri)) {
                    const embed5 = new EmbedBuilder()
                    .setColor(client.config.color)
                    .setDescription(`YouTube is not a supported platform for steaming music.`)
                    return intReply(interaction, ({ embeds: [embed5] }));
                }
                data.playlist.push(track);
            }
            await data.save();
            if (player && !player.queue.current) player.destroy();
            const embed6 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully added the **${s.playlist.name}** \`${playlistName}\` to your playlist.`)
            return intReply(interaction, ({ embeds: [embed6] }));
        } else if (s.type === "TRACK") {
            if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(s.tracks[0].uri)) {
                const embed7 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`YouTube is not a supported platform for steaming music.`)
                return intReply(interaction, ({ embeds: [embed7] }));
            }
            data.playlist.push(s.tracks[0]);
            await data.save();
            if (player && !player.queue.current) player.destroy();
            const embed8 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.success} Successfully added ${s.tracks[0].title} to your playlist ${playlistName}.`)
            return intReply(interaction, ({ embeds: [embed8] }));
        } else if (s.type === "SEARCH") {
            if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(s.tracks[0].uri)) {
                const embed9 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`YouTube is not a supported platform for steaming music.`)
                return intReply(interaction, ({ embeds: [embed9] }));
            }
            data.playlist.push(s.tracks[0]);
            await data.save();
            if (player && !player.queue.current) player.destroy();
            const embed10 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.success} Successfully added ${s.tracks[0].title} to your playlist ${playlistName}.`)
            return intReply(interaction, ({ embeds: [embed10] }));
        } else {
            if (player && !player.queue.current) player.destroy();
            const embed11 = new EmbedBuilder()
                .setColor(client.config.color)
                .setDescription(`${client.config.emojis.error} Couldn't find anything with that query.`)
            return intReply(interaction, ({ embeds: [embed11] }));
        };

    }
}