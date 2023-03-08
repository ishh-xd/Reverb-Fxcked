const { EmbedBuilder, ButtonBuilder, CommandInteraction } = require('discord.js');
const Button = require('../../structures/Button');
const { convertTime, chunk } = require('../../utils/convert');

module.exports = class Pause extends Button {
  constructor(client) {
    super(client, {
      id: 'PAUSE_BUTTON',
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
        value: `${player.queue.current.isStream ? `\`◉ LIVE\`` : convertTime(player.queue.current.length)}`,
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
        value: `${await player.getArtist(this.client, player.queue.current)}`,
        inline: true
      });
    }
    player.pause(!player.paused);
    if (m && m.editable) {
      const { thumbnail } = player.queue.current;
      const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(`${player.playing ? 'Now playing' : 'Paused'} [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
        .setURL(player.queue.current.uri)


      const buttonRow = interaction.message.components[0];
      buttonRow.components[2] = new ButtonBuilder()
        .setCustomId('PAUSE_BUTTON')
        .setStyle(player.paused ? 3 : 2)
        .setEmoji(player.paused ? client.config.bemoji.play : client.config.bemoji.pause),
        new ButtonBuilder()
          .setCustomId('PREVIOUS_BUTTON')
          .setStyle(2)
          .setDisabled(player.queue.previous ? false : true)
          .setEmoji(client.config.bemoji.previous);
      await m.edit({ embeds: [embed], components: [buttonRow] });
    }
    await interaction.update({});
  }
};