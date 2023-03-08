const { intReply, updateQueue } = require('../../handlers/functions');
const Command = require('../../structures/Command');

module.exports = class Clear extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      description: {
        content: 'To clear the queue or filters.',
        usage: 'clear',
        examples: ['clear']
      },
      voteReq: true,
      category: 'music',
      cooldown: 6,
      player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: ['DeafenMembers'],
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
        user: [],
      },
      options: [
        {
          name: "input",
          description: "The clear input.",
          type: 3,
          required: true,
          choices: [
            {
              name: "queue",
              value: "queue"
            },

            {
              name: "filters",
              value: "filters"
            }
          ]
        }
      ],
    })
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const player = this.client.player.players.get(interaction.guildId);

    const input = interaction.options.getString("input");
    if (input === "queue") {
      const embed1 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There are no more songs in the queue to be cleared.`);

      if (!player.queue.length) return await intReply(interaction, { embeds: [embed1] }).catch(() => { });

      player.queue.clear();
      await updateQueue(client, player, interaction.guild);

      const embed2 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} The player queue has now been cleared.`);

      return await intReply(interaction, { embeds: [embed2] }).catch(() => { });
    } else if (input === "filters") {
      const embed3 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} There are no filters in use..`);
      if (!player.filters) return await intReply(interaction, { embeds: [embed3] }).catch(() => { });

      player.shoukaku.clearFilters()
      await updateQueue(client, player, interaction.guild);
      const embed4 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} The player filters have been disabled.`);
      return await intReply(interaction, { embeds: [embed4] }).catch(() => { });
    }
  }
}