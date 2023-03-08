const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")

module.exports = class SkipTo extends Command {
  constructor(client) {
    super(client, {
      name: 'skipto',
      description: {
        content: 'To skip to a position in the queue.',
        usage: 'skipto <position>',
        examples: ['skipto 5']
      },
      category: 'music',
      voteReq: true,
      cooldown: 3,
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
          name: 'position',
          description: 'The position you want to skip to.',
          type: 4,
          required: true,
        },

      ],
    });
  }

  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const player = client.player.players.get(interaction.guildId);
    const args = interaction.options.getInteger('position');
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} There are insufficient songs in the queue to skip to.`)
    if (!player.queue.length) return await intReply(interaction, ({ embeds: [embed] }));
    const position = parseInt(args);
    const embed1 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} Position must be a valid number.`)
    if (isNaN(position)) return await intReply(interaction, ({ embeds: [embed1] }));
    const embed2 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} Position must be higher than 0.`)
    if (position <= 0) return await intReply(interaction, ({ embeds: [embed2] }));
    const embed3 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} Position must be lower than the queue size.`)
    if (position > player.queue.length) return await intReply(interaction, ({ embeds: [embed3] }));

    if (args == 1) player.shoukaku.stopTrack();
    player.queue.splice(0, position - 1);
    await player.shoukaku.stopTrack();
    
    const embed4 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.success} Successfully skipped to track **#${position}** in the queue.`)
    return await intReply(interaction, ({ embeds: [embed4] }));
  }
}