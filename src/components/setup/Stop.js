const Button = require('../../structures/Button');
const { convertTime } = require('../../utils/convert');
const { EmbedBuilder } = require('discord.js');
const { buttonReply } = require("../../handlers/functions");
module.exports = class Stop extends Button {
  constructor(client) {
    super(client, {
      id: 'SETUP_STOP_BUTTON',
    });
  }
  async run(client, interaction, player, data, color, int) {
    let icon = player.queue.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;
    let message;
    try {

      message = await interaction.channel.messages.fetch({ message: data.message, cache: true, force: true });

    } catch (e) { };
    if (message) {

      player.destroy();

      let nowplaying = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
        .setURL(player.queue.current.uri)
        .setImage(icon)
        .setFooter({ text: `${interaction.member.user.tag} stopped the track.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });

      if (message) await message.edit({ embeds: [nowplaying] });

    }
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    const embed103 = new EmbedBuilder()
      .setColor(color)
      .setDescription(`${client.config.emojis.success} The player has disconnected`)
    
    if (interaction.replied) {
        await interaction.editReply({ embeds: [embed103] })
    } else {
        await interaction.followUp({ embeds: [embed103] })
    };

    return deelete(interaction)
  }
}

function deleete(int) {
    setTimeout(async () => {
        if (int && !int.ephemeral) {
            await int.deleteReply().catch(() => { });
        };
    }, 2000);
}