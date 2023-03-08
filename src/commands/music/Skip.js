const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class Skip extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      description: {
        content: 'To skip the current song.',
        usage: 'skip',
        examples: []
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
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: [],
      },
    });
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    let player = client.player.players.get(interaction.guildId);

    const { title, uri } = player.queue.current;
    player.shoukaku.stopTrack();
    await updateQueue(client, player, interaction.guild);
    const embed = new EmbedBuilder()
      .setColor(client.config.color)
      .setDescription(`Successfully skipped [${title}](${uri})`)
    await intReply(interaction, ({ embeds: [embed] }));
  }
}
