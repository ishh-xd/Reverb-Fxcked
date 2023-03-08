const { EmbedBuilder, ButtonBuilder, CommandInteraction, ActionRowBuilder } = require('discord.js');
const Button = require('../../structures/Button');
const { convertTime, chunk } = require('../../utils/convert');

module.exports = class Voldown extends Button {
  constructor(client) {
    super(client, {
      id: 'SETUP_VOL_UP_BUTTON',
    });
  }
  async run(client, interaction, player, data, color) {
    let icon = player.queue.current.thumbnail ? player.queue.current.thumbnail : client.config.links.image;
    let author = player.queue.current.author ? player.queue.current.author : 'Unknown';
    let map = player.queue.map((x, i) => `**${i + 1}.** ${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
    let pages = chunk(map, 2).map((x) => x.join("\n"));
    let page = 0;

    let message;
    try {

      message = await interaction.channel.messages.fetch({ message: data.message, cache: true, force: true });

    } catch (e) { };
    if (message) {
      const volume = player.volume * 100 + 10;
      const embed102 = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`The volume cannot be higher than 100%`)
      if (volume >= 110) return interaction.reply({ embeds: [embed102], ephemeral: true });
      player.setVolume(volume)
      let fields = []
      fields.push(
        {
          name: "Queued Track(s)",
          value: `${player.queue.length ? player.queue.length : `0`}`,
          inline: true
        },
        {
          name: "Track Loop",
          value: `${player.loop === 'track' ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Requested by",
          value: `${player.queue.current.requester}`,
          inline: true
        },
        {
          name: "Autoplay",
          value: `${player.autoplay ? `${client.config.emojis.online}` : `${client.config.emojis.offline}`}`,
          inline: true
        },
        {
          name: "Duration",
          value: `**${convertTime(player.queue.current.length)}**`,
          inline: true
        }
      );
      if (player.queue.length > 0) {
        fields.push({
          name: `Up next`,
          value: `${pages[page]}`,
          inline: true
        });
      } else {
        fields.push(
          {
            name: `Author`,
            value: `${author}`,
            inline: true
          },
        )
      }
      let queueStats = new EmbedBuilder()
        .setColor(color)
        .setTitle("Queue statistics")
        .addFields(fields);
      let nowplaying = new EmbedBuilder()
        .setColor(color)
        .setDescription(`Currently playing [${player.queue.current.title}](${player.queue.current.uri}) by ${await player.getArtist(this.client, player.queue.current)}`)
        .setURL(player.queue.current.uri)
        .setImage(icon)
        .setFooter({ text: `${interaction.member.user.tag} set the volume to ${player.volume * 100}%.`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) });

      let pausebut = new ButtonBuilder().setCustomId(`SETUP_PLAY_PAUSE_BUTTON`).setEmoji(client.config.bemoji.pause).setStyle(2);

      let lowvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_DOWN_BUTTON`).setEmoji(`${client.config.bemoji.voldown}`).setStyle(2);

      let highvolumebut = new ButtonBuilder().setCustomId(`SETUP_VOL_UP_BUTTON`).setEmoji(`${client.config.bemoji.volup}`).setStyle(2);

      let previousbut = new ButtonBuilder().setCustomId(`SETUP_PREVIOUS_BUTTON`).setEmoji(`${client.config.bemoji.previous}`).setStyle(2);

      let skipbut = new ButtonBuilder().setCustomId(`SETUP_SKIP_BUTTON`).setEmoji(`${client.config.bemoji.next}`).setStyle(2);

      let rewindbut = new ButtonBuilder().setCustomId(`REWIND_BUTTON`).setEmoji(`${client.config.bemoji.rewind}`).setStyle(2);

      let forwardbut = new ButtonBuilder().setCustomId(`FORWARD_BUTTON`).setEmoji(`${client.config.bemoji.forward}`).setStyle(2);

      let toggleautoplaybut = new ButtonBuilder().setCustomId(`AUTO_PLAY_BUTTON`).setEmoji(`${client.config.bemoji.infinity}`).setStyle(2);

      let loopmodesbut = new ButtonBuilder().setCustomId(`LOOP_MODE_BUTTON`).setEmoji(`${client.config.bemoji.loop}`).setStyle(2);

      let stopbut = new ButtonBuilder().setCustomId(`SETUP_STOP_BUTTON`).setEmoji(`${client.config.bemoji.stop}`).setStyle(2);

      const row1 = new ActionRowBuilder().addComponents(lowvolumebut, previousbut, pausebut, skipbut, highvolumebut);

      const row2 = new ActionRowBuilder().addComponents(rewindbut, toggleautoplaybut, stopbut, loopmodesbut, forwardbut);

      await message.edit({ embeds: [queueStats, nowplaying], components: [row1, row2] });
    }
    await interaction.update({}).catch(() => { });
  }
}