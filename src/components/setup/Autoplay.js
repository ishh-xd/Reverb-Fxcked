const Button = require('../../structures/Button');
const { convertTime, chunk } = require('../../utils/convert');
const { EmbedBuilder } = require('discord.js');
const { autoplay } = require('../../handlers/functions');

module.exports = class Autoplay extends Button {
  constructor(client) {
    super(client, {
      id: 'AUTO_PLAY_BUTTON',
    });
  }
  async run(client, interaction, player, data, color) {
    let icon = player.queue.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;
    let author = player.queue.current.author ? player.queue.current.author : 'Unknown';
    let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
    let pages = chunk(map, 2).map((x) => x.join("\n"));
    let page = 0;

    let message;
    try {

      message = await interaction.channel.messages.fetch({ message: data.message, cache: true, force: true });

    } catch (e) { };
    if (message) {
      if (!player.autoplay) {
        player.data.set("autoplay", player.queue.current);
        player.autoPlay(true);
        const au = await autoplay(player, client);
        const embed11 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`No songs found to autoplay.`)
        if (au === "null") return interaction.reply({ embeds: [embed11], ephemeral: true });
        let fields = []
        fields.push(
          {
            name: "Queued Track(s)",
            value: `${player.queue.length ? player.queue.length : `0`}`,
            inline: true
          },
          {
            name: "Track Loop",
            value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
            inline: true
          },
          {
            name: "Requested by",
            value: `${player.queue.current.requester}`,
            inline: true
          },
          {
            name: "Autoplay",
            value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
            inline: true
          },
          {
            name: "Duration",
            value: `**${convertTime(player.queue.current.length)}**`,
            inline: true
          }
        );
        if (player.queue.length > 0) {
          fields.push({
            name: `Up next`,
            value: `${pages[page]}`,
            inline: true
          });
        } else {
          fields.push(
            {
              name: `Author`,
              value: `${author}`,
              inline: true
            },
          )
        }
        let queueStats = new EmbedBuilder()
          .setColor(color)
          .setTitle("Queue statistics")
          .addFields(fields);
        let nowplaying = new EmbedBuilder()
          .setColor(color)
          .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
          .setURL(player.queue.current.uri)
          .setImage(icon)
          .setFooter({ text: `${interaction.member.user.tag} ${player.autoplay ? 'enabled' : `disabled`} autoplay.`, iconURL: interaction.member.displayAvatarURL({}) });

        if (message) await message.edit({
          embeds: [queueStats, nowplaying]
        }).catch(() => { });
      } else {
        player.autoPlay(false);
        let fields = []
        fields.push(
          {
            name: "Queued Track(s)",
            value: `${player.queue.length ? player.queue.length : `0`}`,
            inline: true
          },
          {
            name: "Track Loop",
            value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
            inline: true
          },
          {
            name: "Requested by",
            value: `${player.queue.current.requester}`,
            inline: true
          },
          {
            name: "Autoplay",
            value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
            inline: true
          },
          {
            name: "Duration",
            value: `**${convertTime(player.queue.current.length)}**`,
            inline: true
          }
        );
        if (player.queue.length > 0) {
          fields.push({
            name: `Up next`,
            value: `${pages[page]}`,
            inline: true
          });
        } else {
          fields.push(
            {
              name: `Author`,
              value: `${author}`,
              inline: true
            },
          )
        }
        let queueStats = new EmbedBuilder()
          .setColor(color)
          .setTitle("Queue statistics")
          .addFields(fields);
        let nowplaying = new EmbedBuilder()
          .setColor(color)
          .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
          .setURL(player.queue.current.uri)
          .setImage(icon)
          .setFooter({ text: `${interaction.member.user.tag} ${player.autoplay ? 'enabled' : `disabled`} autoplay.`, iconURL: interaction.member.displayAvatarURL({}) });

        if (message) await message.edit({
          embeds: [queueStats, nowplaying]
        }).catch(() => { });
      };

    };
    return await interaction.update({}).catch(() => { });
  };
};