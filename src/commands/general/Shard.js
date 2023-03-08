const Command = require('../../structures/Command');
const { NumberToBNH } = require('../../utils/convert');
const { paginate } = require('../../handlers/functions');
module.exports = class Shard extends Command {
  constructor(client) {
    super(client, {
      name: 'shard',
      description: {
        content: 'Gives information about the bot\'s shards.',
        usage: '<prefix>shard',
        examples: ['shard']
      },
      category: 'info',
      cooldown: 3,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },

    })
  }
  async run(client, interaction) {
    const promises = [
      client.cluster.fetchClientValues('guilds.cache.size'),
      client.cluster.broadcastEval(c => c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
    ];
    const embeds = []
    const shardInfo = await client.cluster.broadcastEval(c => ({
      id: c.cluster.id,
      shards: c.cluster.info.TOTAL_SHARDS,
      status: c.cluster.client.presence.status,
      guilds: c.guilds.cache.size,
      channels: c.channels.cache.size,
      members: c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0),
      players: [...c.player.shoukaku.nodes.values()].map(node => node.stats.players.toString()).reduce((a, b) => Number(a) + Number(b), 0),
      playingPlayers: [...c.player.shoukaku.nodes.values()].map(node => node.stats.playingPlayers.toString()).reduce((a, b) => Number(a) + Number(b), 0),
      ping: c.ws.ping,
    }));

    let totalPlayers = 0;
    let totalPlayingPlayers = 0;
    for (let n = 0; n < shardInfo.length / 15; n++) {
      const shardArray = shardInfo.slice(n * 15, n * 15 + 15);
      const embed = client.embed()
        .setColor(client.config.color)
        .setAuthor({ name: `${client.user.username} Shard Info`, iconURL: client.user.displayAvatarURL() })

      shardArray.forEach(s => {
        const status = s.status === 'online' ? client.config.emojis.online : client.config.emojis.offline;
        embed.addFields(
          {
            name: `${status} Cluster ${(parseInt(s.id)).toString()}`,
            value: `Guilds: **${NumberToBNH(s.guilds)}**\nChannels: **${NumberToBNH(s.channels)}**\nMembers: **${NumberToBNH(s.members)}**\nPlayers: **${s.players}**\nPlaying Players: **${s.playingPlayers}**\nPing: **${Math.round(s.ping)}**ms`,
            inline: true
          }
        )
        totalPlayers += s.players;
        totalPlayingPlayers += s.playingPlayers;
      })
      Promise.all(promises).then(results => {
        let totalChannels = 0;
        shardArray.forEach(s => totalChannels += parseInt(s.channels));
        let apiLatency = 0;
        shardArray.forEach(s => apiLatency += s.ping);
        apiLatency = apiLatency / shardArray.length;
        apiLatency = Math.round(apiLatency);
        const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
        const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
        embed.setDescription(`This guild is currently on shard **${interaction.guild.shardId}** and cluster **${client.cluster.id}**.`)
        embed.addFields(
          {
            name: 'Total Stats',
            value: `Guilds: **${NumberToBNH(totalGuilds)}**\nChannels: **${NumberToBNH(totalChannels)}**\nMembers: **${NumberToBNH(totalMembers)}**\nPlayers: **${totalPlayers}**\nPlaying Players: **${totalPlayingPlayers}**\nPing: **${apiLatency}**ms`,
          }
        )
        embeds.push(embed);
        if (embeds.length === Math.ceil(shardInfo.length / 15)) {
          paginate(client, interaction, embeds);
        }
      })
    }
  }
}