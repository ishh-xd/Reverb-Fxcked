
const db = require("../../schemas/247");
const Event = require("../../structures/Event");
const { updateQueue, autoplay } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class playerStuck extends Event {
  constructor(...args) {
    super(...args);
  }
  async run(player, track) {
    let guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;
    let channel = guild.channels.cache.get(player.textId);

    let data = await db.findOne({ _id: guild.id });
    let color = "#ff0080";

    if (!player.queue.length) {
      if (player.autoplay) {
        let au = await autoplay(player, this.client);
        if (au === "null") {
          if (data && data.mode) {
            if (player) player.shoukaku.stopTrack();
            await updateQueue(this.client, player, guild);
            const embed1 = new EmbedBuilder()
              .setColor("#ff0080")
              .setDescription(`[${track.title}](${track.uri}) has been skipped due to an internal error.`)
            if (channel) await oops(channel, ({ embeds: [embed1] }));
          } else {
            player.destroy();
            const embed2 = new EmbedBuilder()
              .setColor("#ff0080")
              .setDescription(`The player has been destroyed due to an internal error.`)
            if (channel) await oops(channel, ({ embeds: [embed2] }));
          };
        } else {
          player.shoukaku.stopTrack();
          await updateQueue(this.client, player, guild);
          const embed3 = new EmbedBuilder()
            .setColor("#ff0080")
            .setDescription(`[${track.title}](${track.uri}) has been skipped due to an internal error.`)
          if (channel) await oops(channel, ({ embeds: [embed3] }));
        };
      } else {
        if (data && data.mode) {
          if (player) player.shoukaku.stopTrack();
          await updateQueue(this.client, player, guild);
          const embed4 = new EmbedBuilder()
            .setColor("#ff0080")
            .setDescription(`${track.title}](${track.uri}) has been skipped due to an internal error.`)
          if (channel) await oops(channel, ({ embeds: [embed4] }));
        } else {
          player.destroy();
          const embed5 = new EmbedBuilder()
            .setColor("#ff0080")
            .setDescription(`The player has been destroyed due to an internal error.`)
          if (channel) await oops(channel, ({ embeds: [embed5] }));
        };
      };
    } else {
      player.shoukaku.stopTrack();
      await updateQueue(this.client, player, guild);
      const embed6 = new EmbedBuilder()
        .setColor("#ff0080")
        .setDescription(`Skipped [${track.title}](${track.uri}) due to an internal error.`)
      if (channel) await oops(channel, ({ embeds: [embed6] }));
    };
  }
}