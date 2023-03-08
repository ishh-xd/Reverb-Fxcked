const Command = require('../../structures/Command');
const { intReply } = require('../../handlers/functions');
const { EmbedBuilder } = require("discord.js")
module.exports = class Replay extends Command {
  constructor(client) {
    super(client, {
      name: 'replay',
      description: {
        content: 'To replay the current song.',
        usage: 'replay',
        examples: ['replay']
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

    });
  }

  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const player = client.player.players.get(interaction.guildId);
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.error} Failed to replay [${player.queue.current.title}](${player.queue.current.uri})`)
    if (!player.queue.current.isSeekable) return await intReply(interaction, ({ embeds: [embed] }));
    player.shoukaku.seekTo(0);
    const embed1 = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`${client.config.emojis.success} Successfully Replayed [${player.queue.current.title}](${player.queue.current.uri})`)
    return await intReply(interaction, ({ embeds: [embed1] }));
  } 1
}