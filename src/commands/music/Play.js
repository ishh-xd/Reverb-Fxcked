const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js");

module.exports = class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      description: {
        content: 'To play songs from spotify, soundcloud or vimeo.',
        usage: '<song>',
        examples: ['play The hills']
      },
      aliases: ['p'],
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
      },
      options: [
        {
          name: 'song',
          description: "The search query, name/url of the song.",
          type: 3,
          required: true,
        }
      ],

    });
  }
  async run(client, interaction, track) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const query = interaction.options.getString("song");
    const embed8 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.`)
    if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(query)) {
      return intReply(interaction, { embeds: [embed8] }).catch(() => { });
    }
    if (!query) return await intReply(interaction, `Please provide a search query.`);

    let player = client.player.players.get(interaction.guildId);
    if (!player) player = await client.player.createPlayer({
      guildId: interaction.guildId,
      textId: interaction.channelId,
      voiceId: interaction.member.voice.channelId,
      deaf: true,
      shardId: interaction.guild.shardId,
    });

    try {
      const { tracks, type, playlistName } = await player.search(query, { requester: interaction.user, engine: 'spotify' });
      const embed91 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} No results found for **${query}**.`)
      if (!tracks.length) return await intReply(interaction, { embeds: [embed91] }).catch(() => { });

      if (type === "PLAYLIST") {
        for (let track of tracks) {
          const embed9 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.`)
          if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(track.uri)) {
            return intReply(interaction, { embeds: [embed9] }).catch(() => { });
          }
          player.queue.add(track);
        }
        await updateQueue(client, player, interaction.guild);
        if (!player.playing && !player.paused) player.play();
        const embed110 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} Added **${tracks.length}** tracks from [${playlistName.length > 64 ? playlistName.substring(0, 64) + "..." : playlistName}](${query}) to the queue.`)
        return intReply(interaction, { embeds: [embed110] }).catch(() => { });
      } else {
        const embed10 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`Unfortunately, due to recent demand from both Discord and Youtube, we have disabled the bot's ability to play YouTube URLs. This is a tremendous disappointment for everyone, including Reverb's team, however it is likely that this will be a permanent modification to prevent the bot from being unverified. We really regret any inconvenience and aim to have more alternative choices accessible in the near future.`)
        if (/^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi.test(tracks[0].uri)) {
          return intReply(interaction, { embeds: [embed10] }).catch(() => { });
        }
        const embed11 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} Added [${tracks[0].title.length > 64 ? tracks[0].title.substring(0, 64) + "..." : tracks[0].title}](${tracks[0].uri}) by ${await player.getArtist(this.client, tracks[0])} to the queue at position **#${player.queue.length}**`)
        player.queue.add(tracks[0]);
        await updateQueue(client, player, interaction.guild);
        if (!player.playing && !player.paused) player.play();
        return intReply(interaction, { embeds: [embed11] }).catch(() => { });
      }
    } catch (e) {
      const embed12 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.error} The players are not currently available. If you find this upsetting, please report it to the [support server](${client.config.links.server})`)
      return await intReply(interaction, { embeds: [embed12] }).catch(() => { });
    }
  }
}