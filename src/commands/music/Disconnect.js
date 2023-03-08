const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Stop extends Command {
  constructor(client) {
    super(client, {
      name: 'disconnect',
      description: {
        content: 'To stop/destroy the player.',
        usage: 'disconnect',
        examples: []
      },
      category: 'music',
      cooldown: 6,
      player: {
        voice: true,
        dj: true,
        active: false,
        djPerm: ['DeafenMembers'],
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
    });
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    let player = client.player.players.get(interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} There is nothing playing right now.`)
    if (!player) return await intReply(interaction, ({ embeds: [embed] }));
    player.destroy();
    await updateQueue(client, player, interaction.guild);
    const embed1 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.success} The player has disconnected.`)
    await intReply(interaction, ({ embeds: [embed1] }));

  }
}