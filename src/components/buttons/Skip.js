const { EmbedBuilder, CommandInteraction } = require('discord.js');
const Button = require('../../structures/Button');

module.exports = class Skip extends Button {
  constructor(client) {
    super(client, {
      id: 'SKIP_BUTTON',
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



    player.skip();
    if (m && m.editable) {
      const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Successfully skipped [${player.queue.current.title}](${player.queue.current.uri})`)
        .setURL(player.queue.current.uri)

      await m.edit({ embeds: [embed], components: [] });
    }
    await interaction.update({});
  }
};