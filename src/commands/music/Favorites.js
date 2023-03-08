const Command = require('../../structures/Command');
const { SelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")
const Favorite = require("../../schemas/favorite");

module.exports = class Search extends Command {
    constructor(client) {
        super(client, {
            name: 'favorites',
            description: {
                content: 'To view and play tracks from your favorites list',
                usage: 'favorites',
                examples: ['', '']
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
        })
    }

    async run(client, interaction) {
        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        let player = client.player.players.get(interaction.guildId);
      
        if (!player) player = await client.player.createPlayer({
            guildId: interaction.guildId,
            textId: interaction.channelId,
            voiceId: interaction.member.voice.channelId,
            deaf: true,
            shardId: interaction.guild.shardId,
        });

        try {
            if (player && player.playing) {
                player.queue.clear();
                await updateQueue(client, player, interaction.guild);
                player.shoukaku.stopTrack();
                await updateQueue(client, player, interaction.guild);
            }

            const fav = await Favorite.findOne({ guildId: interaction.guildId, userId: interaction.user.id });
            if (!fav || !fav.songs || fav.songs.length === 0) return intReply(interaction, "You don't have any songs in your favorite list.");
            const songs = fav.songs;

            const str = songs.map(r => `**${++n}.** [${r.title}](${r.uri})`).join('\n');

            const embed = new EmbedBuilder()
                .setTitle("Favorites List")
                .setDescription("Select a track to play")
        } catch (e) {
            console.log(e)
        } 
    }
}

