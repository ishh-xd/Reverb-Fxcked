const { EmbedBuilder, CommandInteraction } = require('discord.js');
const Button = require('../../structures/Button');
const { convertTime, chunk } = require('../../utils/convert');

module.exports = class Volup extends Button {
  constructor(client) {
    super(client, {
      id: 'VOL_UP_BUTTON',
    });
  }
  /**
   * 
   * @param {import('../../Moe').Client} client 
   * @param {CommandInteraction} interaction 
   * @param {String} color 
   * @returns 
   */

  async run(client, interaction, color) {
    const player = client.player.players.get(interaction.guild.id);
    if (!player) return;
    const m = await player.getNowplayingMessage();
    let author = player.queue.current.author ? player.queue.current.author : 'Unknown';
    let map = player.queue.map((x, i) => `${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
    let pages = chunk(map, 1).map((x) => x.join("\n"));
    let page = 0;

    let filds = [];

    filds.push(
      {
        name: `Requested by`,
        value: `${player.queue.current.requester}`,
        inline: true
      },
      {
        name: `Duration`,
        value: `${player.queue.current.isStream ? `\`◉ ◉ LIVE\`` : convertTime(player.queue.current.length)}`,
        inline: true
      },
    )
    if (player.queue.length > 0) {
      filds.push({
        name: `Up next`,
        value: `${pages[page]}`,
        inline: true
      });
    } else {
      filds.push({
        name: `Author`,
        value: `${author}`,
        inline: true
      });
    }
    const amount = player.volume * 100 + 10
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription("The volume cannot be higher than 100%")
    if (amount >= 110) return interaction.reply({ embeds: [embed], ephemeral: true });
    await player.setVolume(amount);
    if (m && m.editable) {
      const embed1 = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Successfully set the volume to ${player.volume * 100}%`)
      await interaction.reply({ embeds: [embed1], ephemeral: true });
    }
    await interaction.update({});
  }
}