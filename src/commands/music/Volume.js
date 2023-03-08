const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Volume extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      description: {
        content: 'To change the volume of the music player.',
        usage: 'volume <volume>',
        examples: []
      },
      category: 'music',
      cooldown: 6,
      player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: ["DeafenMembers"],
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
      options: [
        {
          name: 'set',
          description: 'Set the volume of the music player.',
          type: 1,
          options: [
            {

              name: "amount",
              description: "The volume amount.",
              type: 4,
              min_value: 0,
              max_value: 200,
              required: true,
            }
          ]
        },
        {
          name: "reset",
          description: "Reset the volume to 80%",
          type: 1,
          required: false
        }
      ],

    });
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    let player = client.player.players.get(interaction.guildId);
    const args = interaction.options.getInteger('amount');
    const subCommand = interaction.options.data[0].name;
    switch (subCommand) {
      case "set":
        const embed = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.error} Please provide a valid amount.`)
        if (!args) return await intReply(interaction, ({ embeds: [embed] }));
        let volume;
        if (args.toString().includes('%')) {
          volume = args.toString().replace('%', '');
        } else {
          volume = args;
        }
        if (volume > 200) {
          const embed1 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} Volume cannot be higher than 200%`)
          return intReply(interaction, ({ embeds: [embed1] }));
        }
        if (volume < 0) {
          const embed2 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} Volume cannot be lower than 0%`)
          return intReply(interaction, ({ embeds: [embed2] }));

        }
        if (isNaN(volume)) {
          const embed3 = new EmbedBuilder()
            .setColor(client.config.color)
            .setDescription(`${client.config.emojis.error} Volume must be a valid number`)
          return intReply(interaction, ({ embeds: [embed3] }));
        }
        player.setVolume(volume);
        await updateQueue(client, player, interaction.guild);
        const embed4 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.voice} Volume has been set to **${player.volume * 100}%**`)
        await intReply(interaction, ({ embeds: [embed4] }));

        break;
      case "reset":
        player.setVolume(80);
        await updateQueue(client, player, interaction.guild);
        const embed5 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.voice} Volume has been reset to **80%**`)
        await intReply(interaction, ({ embeds: [embed5] }));
        break;
    }
  }
}