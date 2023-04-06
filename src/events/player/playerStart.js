const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionsBitField, WebhookClient } = require("discord.js");
const Event = require("../../structures/Event");
const missingPermissions = require('../../utils/missingPermissions')
const { convertTime, chunk } = require('../../utils/convert')
const db = require("../../schemas/setup");
const { trackStartEventHandler } = require("../../handlers/functions");
const db2 = require("../../schemas/announce");

module.exports = class playerStart extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {import('kazagumo').KazagumoPlayer} player 
   * @param {import('kazagumo').KazagumoTrack} track 
   * @returns 
   */
  async run(player, track) {

    let guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;
    let channel = guild.channels.cache.get(player.textId);
    if (!channel) return;
    let color = this.client.config.color ? this.client.config.color : "BLURPLE";
    let data = await db.findOne({ _id: guild.id });
    let data2 = await db2.findOne({ _id: guild.id });

    if (data2 && !data2.mode) return;
    if (data2 && data2.channel) channel = guild.channels.cache.get(data2.channel);

    if (data2 && data2.prunning) {

      const m = await channel.send({ embeds: [new EmbedBuilder().setColor(color).setDescription(`Now playing [${track.title}](${track.uri}) requested by [${track.requester}]`)] });

      return await player.setNowplayingMessage(m);
    };

    if (data && data.channel) {
      let guildId = this.client.guilds.cache.get(data._id)
      let textChannel = guildId.channels.cache.get(data.channel);
      let id = data.message;

      if (!textChannel) return;

      if (channel && textChannel && channel.id === textChannel.id) {
        if (data2 && data2.mode && data2.channel) {
          channel = guild.channels.cache.get(data2.channel);

          if (data2.prunning) {
            let me1;
            if (channel && channel.sendable && channel.id !== textChannel.id) me1 = await channel.send({ embeds: [new EmbedBuilder().setColor(color).setDescription(`Now playing [${track.title}](${track.uri}) reqeusted by [${track.requester}]`)] });


            if (me1) await player.setNowplayingMessage(me1);
          } else {
            if (channel && channel.id !== textChannel.id && channel.sendable) await channel.send({ embeds: [new EmbedBuilder().setColor(color).setDescription(`Now playing [${track.title}](${track.uri}) requested by [${track.requester}]`)] }).catch(() => { });
          };
        };

        if (textChannel.permissionsFor(guild.members.me).has("SendMessage") && textChannel.permissionsFor(guild.members.me).has("ViewChannel")) {
          await trackStartEventHandler(id, textChannel, player, track, this.client, color);
        };

        return;
      } else {
        if (textChannel.permissionsFor(guild.members.me).has("SendMessage") && textChannel.permissionsFor(guild.members.me).has("ViewChannel")) {
          await trackStartEventHandler(id, textChannel, player, track, this.client, color);
        };
      };

    } else {

      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('VOL_DOWN_BUTTON')
            .setStyle(2)
            .setEmoji(this.client.config.bemoji.voldown),
          new ButtonBuilder()
            .setCustomId('PREVIOUS_BUTTON')
            .setStyle(2)
            .setDisabled(player.queue.previous ? false : true)
            .setEmoji(this.client.config.bemoji.previous),
          new ButtonBuilder()
            .setCustomId('PAUSE_BUTTON')
            .setStyle(2)
            .setEmoji(this.client.config.bemoji.pause),
          new ButtonBuilder()
            .setCustomId('SKIP_BUTTON')
            .setStyle(2)
            .setEmoji(this.client.config.bemoji.next),
          new ButtonBuilder()
            .setCustomId('VOL_UP_BUTTON')
            .setStyle(2)
            .setEmoji(this.client.config.bemoji.volup));

            

      try {
        const missingPerms = missingPermissions([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages], channel, guild.members.me);
        if (missingPerms.length > 0) return;
        let author = track.author ? track.author : 'Unknown';
        let map = player.queue.map((x, i) => `${x.title && x.uri ? `[${x.title}](${x.uri})` : `${x.title}`}`);
        let pages = chunk(map, 1).map((x) => x.join("\n"));
        let page = 0;

        let filds = [];

        filds.push(
          {
            name: `Requested by`,
            value: `${track.requester}`,
            inline: true
          },
          {
            name: `Duration`,
            value: `${track.isStream ? `\`◉ LIVE\`` : convertTime(track.length)}`,
            inline: true
          }

        )
        if (player.queue.length > 0) {
          filds.push({
            name: `Up next`,
            value: `${pages[page]}`,
            inline: true
          });
        } else {
          filds.push(
            {
              name: `Author`,
              value: `${await player.getArtist(this.client, track)}`,
              inline: true
            },
          )
        }
        const { thumbnail } = player.queue.current;
        let Embed = new EmbedBuilder()
          .setColor(color)
          .setDescription(`Now playing [${track.title}](${track.uri}) by ${await player.getArtist(this.client, track)}`)
          .setURL(track.uri)
        let ms = await channel.send({ embeds: [Embed], components: [buttonRow] });
        await player.setNowplayingMessage(ms);
      } catch (e) { 
        this.client.logger.error(e)
      }
    }
  }
};