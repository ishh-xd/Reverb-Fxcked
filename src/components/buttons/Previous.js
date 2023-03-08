const Button = require('../../structures/Button');
const { moveArray } = require('../../handlers/functions');
const { convertTime } = require('../../utils/convert');

module.exports = class Previous extends Button {
  constructor(client) {
    super(client, {
      id: 'PREVIOUS_BUTTON',
    });
  }
  /**
   * 
   * @param {import('../../Moe').Client} client 
   * @param {import('discord.js')CommandInteraction} interaction 
   * @param {String} color 
   * @returns 
   */
  async run(client, interaction, color) {
    const player = client.player.players.get(interaction.guild.id);
    if (!player) return;
    player.queue.add(player.queue.previous);
    if (player && !player.playing && !player.paused && !player.queue.length) await player.play();

    if (player.queue.length === 1) {
      player.shoukaku.stopTrack();
    } else {
      const move = moveArray(player.queue, player.queue.length - 1, 0);
      player.queue.clear();
      player.queue.add(move);
      if (player.queue.current.title !== player.queue.previous.title || player.queue.current.uri !== player.queue.previous.uri) player.shoukaku.stopTrack();
    };
    const embed = client.embed()
      .setColor(color)
      .setDescription(`${client.config.emojis.success} Added [${player.queue?.previous.title}](${player.queue?.previous.uri}) by ${await player.getArtist(this.client, player.queue.current)} to the queue at position **#${player.queue.length}**`)
    await interaction.reply({ embeds: [embed] });
  }

};