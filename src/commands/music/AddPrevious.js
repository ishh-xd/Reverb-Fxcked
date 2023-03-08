const Command = require('../../structures/Command');
const { updateQueue, intReply } = require("../../handlers/functions");

module.exports = class AddPrevious extends Command {
  constructor(client) {
    super(client, {
      name: 'addprevious',
      description: {
        content: 'Adds the previous song to the queue.',
        usage: 'addprevious',
        examples: ['addprevious']
      },
      voteReq: true,
      category: 'music',
      cooldown: 6,
      player: {
        voice: true,
        dj: false,
        active: true,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
        user: [],
      },
    })
  }
  async run(client, interaction) {
    const embed = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.error} No previously added track found in the queue.`);
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const player = client.player.players.get(interaction.guildId);
    if (!player.queue.previous) return await intReply(interaction, { embeds: [embed] }).catch(() => { });
    player.queue.add(player.queue.previous);
    if (player && !player.playing && !player.paused && !player.queue.length) await player.play();
    const { title, uri } = player.queue.previous;
    const embed1 = client.embed().setColor(client.config.color).setDescription(`${client.config.emojis.success} Added **${title}** to the queue.`);
    return await intReply(interaction, { embeds: [embed1] }).catch(() => { });
  }
}
