const { wait, updateQueue, intReply, autoplay } = require("../../handlers/functions");
const Event = require("../../structures/Event");
const { EmbedBuilder } = require("discord.js")

module.exports = class playerMoved extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {import("kazagumo").KazagumoPlayer} player 
   * @param {import('kazagumo').PlayerMovedState} state 
   * @param {import('kazagumo').PlayerMovedChannels} channel 
   * @returns 
   */
  async run(player, state, channel, client) {
    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;
    const text = guild.channels.cache.get(player.textId);
    try {
      switch (state) {
        case 'LEFT':
          if (channel.oldChannelId === channel.newChannelId) return;
          if (channel.newChannelId === null || !channel.newChannelId) {
            if (!player) return;
            const embed1 = new EmbedBuilder().setColor("#ff0080").setDescription(`${this.client.config.emojis.disconnect} I have been disconnected from <#${channel.oldChannelId}>`)
            await text.sendtext.send({ embeds: [embed1] }).then((msg) => setTimeout(() => { if (msg && msg.deletable) msg.delete() }, 5000)).catch(() => { });
            await updateQueue(this.client, player, guild);
            player.destroy();
          }
          break;
        case 'MOVED':
          player.changeVoiceChannel(channel.newChannelId);
          if (player.state !== 'CONNECTED') player.setVoiceChannel(channel.newChannelId);
          const embed2 = new EmbedBuilder().setColor("#ff0080").setDescription(`I have been moved from <#${channel.oldChannelId}> to <#${channel.newChannelId}>`)
          await text.send({ embeds: [embed2] }).then((msg) => setTimeout(() => { if (msg && msg.deletable) msg.delete() }, 5000)).catch(() => { });
          wait(5000)
          await updateQueue(this.client, player, guild);
          if (player.paused) player.pause(false);
          break;
        case 'UNKNOWN':
          player.destroy();
          break;
      }
    } catch (e) {
      console.log(e)
    };
  }
};