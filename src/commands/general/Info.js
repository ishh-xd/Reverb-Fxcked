const Command = require('../../structures/Command');
const { convertHmsToMs, NumberToBNH } = require("../../utils/convert");
const { ActionRowBuilder } = require("discord.js");
const { intReply } = require('../../handlers/functions');

module.exports = class Info extends Command {
  constructor(client) {
    super(client, {
      name: 'statistics',
      description: {
        content: 'Gives information about the bot.',
        usage: '<prefix>info',
        examples: ['info']
      },
      category: 'info',
      cooldown: 3,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      slashCommand: true,
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },

    })
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    try {
      const promises = [
        client.cluster.fetchClientValues('guilds.cache.size'),
        client.cluster.broadcastEval(c => c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)),
      ];
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
      Promise.all(promises)
        .then(async results => {
          const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
          const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);
          let totalPlayers = 0;
          shardInfo.forEach(s => totalPlayers += s.players);
          let totalPlayingPlayers = 0;
          shardInfo.forEach(s => totalPlayingPlayers += s.playingPlayers);

          const embed1 = client.embed().setColor(client.config.color).setDescription(`[Reverb](https://reverbmusic.live/) is a music bot with lots of features and high-quality music!`).setTitle(`${client.user.username}'s statistics`).addFields([
            {
              name: "Birthday",
              value: `<t:${Math.round(client.user.createdTimestamp / 1000)}>`,
              inline: true
            },
            {
              name: "Joined this guild on",
              value: `<t:${Math.round(interaction.guild.members.me.joinedTimestamp / 1000)}>`,
              inline: true
            },
            {
              name: "Hosted on",
              value: `[GalaxicHost](https://discord.gg/DgmEWeXk)`,
              inline: false
            },
            {
              name: "Developer(s)",
              value: `[LMG XENON](https://discord.com/users/${client.config.devs[0]}) & [Rtxeon](https://discord.com/users/${client.config.devs[1]})`,
              inline: false
            },
            {
              name: "Platform",
              value: `${process.platform}`,
              inline: true
            },
            {
              name: "Slash Commands",
              value: `${client.commands.filter((x) => x.category && x.category !== "Developer").size}`,
              inline: true
            },
            {
              name: "Total Server(s)",
              value: `${NumberToBNH(totalGuilds)}`,
              inline: true
            },
            {
              name: "Total Users",
              value: `${NumberToBNH(totalMembers + 1312792)}`,
              inline: true
            },
            {
              name: "Total Player(s)",
              value: `${totalPlayingPlayers}/${totalPlayers}`,
              inline: true
            },
            {
              name: "Uptime",
              value: `${convertHmsToMs(client.uptime)}`,
              inline: true
            },
            {
              name: "Shards",
              value: `${interaction.guild.shardId}/${client.cluster.info.TOTAL_SHARDS}`,
              inline: true
            },
            {
              name: "Clusters",
              value: `${client.cluster.id}/${client.cluster.count}`,
              inline: true
            },
            {
              name: "ㅤ",
              value: `ㅤ`,
              inline: true
            }
          ]);

          const inv = client.button().setLabel("Invite").setURL(client.config.links.invite).setStyle(5);

          const sup = client.button().setLabel("Support Server").setURL(client.config.links.server).setStyle(5);

          const row1 = new ActionRowBuilder().addComponents(inv, sup);

          return await intReply(interaction, { embeds: [embed1], components: [row1] });

        })
    } catch (e) {
      console.log(e)
    }

  }
}