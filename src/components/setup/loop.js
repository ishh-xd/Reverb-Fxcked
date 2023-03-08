const Button = require('../../structures/Button');
const { convertTime, chunk } = require('../../utils/convert');
const { EmbedBuilder } = require('discord.js');

module.exports = class Loop extends Button {
  constructor(client) {
    super(client, {
      id: 'LOOP_MODE_BUTTON',
    });
  }
  async run(client, interaction, player, data, color) {
    let icon = player.queue.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;

    let message;
    try {

      message = await interaction.channel.messages.fetch({ message: data.message, cache: true, force: true });

    } catch (e) { };
    if (message) {
      let author = player.queue.current.author ? player.queue.current.author : 'Unknown';
      let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
      let pages = chunk(map, 2).map((x) => x.join("\n"));
      let page = 0;

      if (!player.queue.length) {
        if (player.loop === 'track') {
          player.setLoop('none');

          let nowplaying = new EmbedBuilder()
            .setColor(color)
            .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
            .setURL(player.queue.current.uri)
            .setImage(icon)
            .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'track' ? `enabled` : `disabled`} track loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });
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

          if (message) await message.edit({ embeds: [queueStats, nowplaying] });
        } else {
          player.setLoop('track')
          let nowplaying = new EmbedBuilder()
            .setColor(color)
            .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
            .setURL(player.queue.current.uri)
            .setImage(icon)
            .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'track' ? `enabled` : `disabled`} track loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });
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

          if (message) await message.edit({ embeds: [queueStats, nowplaying] });
        };
      } else {
        const choices = ["track", "queue"];
        let random = choices[Math.floor(Math.random() * choices.length)];

        if (random === choices[0]) {
          if (player.loop === 'track') {
            player.setLoop('none');
            let nowplaying = new EmbedBuilder()
              .setColor(color)
              .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
              .setURL(player.queue.current.uri)
              .setImage(icon)
              .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'track' ? `enabled` : `disabled`} track loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });
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

            if (message) await message.edit({ embeds: [queueStats, nowplaying] });
          } else {
            player.setLoop('track')
            let nowplaying = new EmbedBuilder()
              .setColor(color)
              .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
              .setURL(player.queue.current.uri)
              .setImage(icon)
              .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'track' ? `enabled` : `disabled`} track loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });
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

            if (message) await message.edit({ embeds: [queueStats, nowplaying] });
          };
        } else if (random === choices[1]) {
          if (player.loop === 'queue') {
            player.setLoop('none');
            let nowplaying = new EmbedBuilder()
              .setColor(color)
              .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
              .setURL(player.queue.current.uri)
              .setImage(icon)
              .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'queue' ? `enabled` : `disabled`} queue loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });

            let fields2 = []
            fields2.push(
              {
                name: "Queued Track(s)",
                value: `${player.queue.length ? player.queue.length : `0`}`,
                inline: true
              },
              {
                name: "Queue Loop",
                value: `${player.loop === 'queue' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
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
              fields2.push({
                name: `Up next`,
                value: `${pages[page]}`,
                inline: true
              });
            } else {
              fields2.push(
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
              .addFields(fields2);
            if (message) await message.edit({ embeds: [queueStats, nowplaying] });
          } else {
            player.setLoop('queue')
            let nowplaying = new EmbedBuilder()
              .setColor(color)
              .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
              .setURL(player.queue.current.uri)
              .setImage(icon)
              .setFooter({ text: `${interaction.member.user.tag} ${player.loop === 'queue' ? `enabled` : `disabled`} queue loop.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });

            let fields2 = []
            fields2.push(
              {
                name: "Queued Track(s)",
                value: `${player.queue.length ? player.queue.length : `0`}`,
                inline: true
              },
              {
                name: "Queue Loop",
                value: `${player.loop === 'queue' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
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
              fields2.push({
                name: `Up next`,
                value: `${pages[page]}`,
                inline: true
              });
            } else {
              fields2.push(
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
              .addFields(fields2);

            if (message) await message.edit({ embeds: [queueStats, nowplaying] });
          };
        };
      }
    }
    await interaction.update({}).catch(() => { });
  };
};