const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js");
const Favorite = require("../../schemas/favorite");

module.exports = class PlayFavorites extends Command {
  constructor(client) {
    super(client, {
      name: 'playfavorite',
      description: {
        content: 'To play songs which is saved in your favorites list.',
        examples: ['favorite']
      },
      aliases: ['pf'],
      category: 'music',
      cooldown: 3,
      player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      }

    });
  }
  async run(client, interaction, track) {
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
      songs.forEach(async (song) => {
        const { tracks } = await player.search(songs, { requester: interaction.user, engine: 'spotify' });

        player.queue.add(tracks[0]);
      });
    } catch (e) {
      console.log(e);
      return intReply(interaction, "An error occured while trying to play your favorite songs.");
    }
  }
}
