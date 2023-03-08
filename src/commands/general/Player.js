const Command = require("../../structures/Command");
const _247 = require("../../schemas/247");
const announce = require("../../schemas/announce");
const dj = require("../../schemas/dj");
const { convertTime } = require('../../utils/convert')
const setup = require("../../schemas/setup");
const { EmbedBuilder } = require("discord.js");

module.exports = class Player extends Command {
  constructor(client) {
    super(client, {
      name: "player",
      description: {
        content: "To get the player details.",
        usage: "player",
        examples: ["player"]
      },
      category: "Info",
      cooldown: 3,
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      args: false,
      player: {
        active: false,
        voice: false,
        dj: false,
        djPerm: null
      },
      options: [
        {
          name: "input",
          description: "Choose an input type.",
          type: 3,
          required: true,
          choices: [
            {
              name: "status",
              value: "status"
            },

            {
              name: "queue",
              value: "queue"
            },

            {
              name: "settings",
              value: "settings"
            }
          ]
        }
      ]
    });
  }
  async run(client, interaction) {
    const player = client.player.players.get(interaction.guildId);

    const input = interaction.options.getString("input");

    if (!input) return await interaction.reply(`Please provide an input, inorder to proceed.`);
    switch (input) {
      case "status":
        await interaction.reply({ embeds: [new EmbedBuilder().setColor(client.config.color).setDescription(`Player status: ${player ? "**active**" : "**inactive**"}`)] }).catch(() => { });

        break;
      case "queue":
        await interaction.reply({
          content: null, embeds: [client.embed().setTitle("Player queue").setColor(client.config.color).setDescription(`The player queue is currently ${player && player.queue ? "**Active**." : "**Inactive**."}`).addFields([

            {
              name: "Volume",
              value: `**${player && player.volume ? player.volume : 0}**`,
              inline: true
            },

            {
              name: "Total Tracks",
              value: `${player && player.queue && player.queue.length ? "**" + player.queue.length + "**" : "**0**"}`,
              inline: true
            },

            {
              name: "Total Duration",
              value: `${player && player.queue && player.queue.duration ? "**" + convertTime(Number(player.queue.duration)) + "*" : "**0**"}`,
              inline: true
            },

            {
              name: "Track Loop",
              value: `${player && player.loop === 'track' ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}`,
              inline: true
            },

            {
              name: "Queue Loop",
              value: `${player && player.queueRepeat ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}`,
              inline: true
            },

            {
              name: "Filters",
              value: `${player && player.filters ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`}`,
              inline: true
            }
          ])]
        }).catch(() => { });
        break;
      case "settings":
        let djdata = await dj.findOne({ _id: interaction.guildId });
        let announcedata = await announce.findOne({ _id: interaction.guildId });
        let setupdata = await setup.findOne({ _id: interaction.guildId });
        let _247data = await _247.findOne({ _id: interaction.guildId });

        await interaction.reply({
          embeds: [client.embed().setColor(client.config.color).setTitle(`Player settings`).addFields([
            {
              name: "Setup",
              value: setupdata ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`,
              inline: true
            },

            {
              name: "Autoplay",
              value: player && player.autoplay ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`,
              inline: true
            },

            {
              name: "DJ",
              value: djdata && djdata.mode ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`,
              inline: true
            },

            {
              name: "Announcing",
              value: announcedata && announcedata.mode ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`,
              inline: true
            },

            {
              name: "24/7",
              value: _247data && _247data.mode ? `${this.client.config.emojis.online}` : `${this.client.config.emojis.offline}`,
              inline: true
            }
          ])]
        }).catch(() => { })
    }
  }
}