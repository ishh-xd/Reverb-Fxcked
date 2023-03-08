const Button = require('../../structures/Button');

module.exports = class EndPrevious extends Button {
  constructor(client) {
    super(client, {
      id: 'END_PREVIOUS',
    });
  }
  /**
   * 
   * @param {import('../../structures/Client').botClient} client 
   * @param {import('discord.js').CommandInteraction} interaction 
   * @param {String} color 
   * @returns 
   */
  async run(client, interaction, color) {
    const player = client.player.players.get(interaction.guild.id);
    if (!player) return;
    let msg = await player.getNowplayingMessage();
    const trackButton = client.button().setCustomId(`END_PREVIOUS`).setLabel("Add previous track to the queue").setStyle(3)

    let member = interaction.guild.members.cache.get(client.user.id)
    if (msg) {
      if (member.voice.channel && player && member.voice.channel.id === player.voiceId) {
        if (player && player.queue.previous) {
          player.queue.add(player.queue.previous);
          if (player && !player.playing && !player.paused) player.play();
          const embed11 = client.embed()
            .setColor(color)
            .setDescription(`${client.config.emojis.success} Added [${player.queue?.previous.title}](${player.queue?.previous.uri}) by ${await player.getArtist(this.client, player.queue.current)} to the queue at position **#${player.queue.length}**`)

          if (msg && msg.editable) await interaction.reply({ embeds: [embed11] });
        } else {
          if (msg && msg.editable) await msg.reply({
            components: [client.raw().addComponents([trackButton.setDisabled(true), inv, vote])]
          })
        }
      } else {
        if (msg && msg.editable) await msg.reply({
          components: [client.raw().addComponents([trackButton.setDisabled(true), inv, vote])]
        })
        if (player && !player.queue.current) {
          player.destroy();
        }
      }
    }
  }
}