const Event = require("../../structures/Event");
const { ChannelType } = require("discord.js");
const { oops } = require("../../handlers/functions");
const db = require("../../schemas/247");

module.exports = class VoiceStateUpdate extends Event {
  constructor(...args) {
    super(...args);
  }
  async run(oldState, newState) {
    let player = this.client.player.players.get(newState.guild.id);
    if (!player) return;
    const guild = this.client.guilds.cache.get(player.guildId);

    if (!guild) return;
    if (!newState.guild.members.cache.get(this.client.user.id).voice.channelId) player.destroy();

    if (newState.id === this.client.user.id && newState.channelId && newState.channel.type == ChannelType.GuildStageVoice && newState.guild.members.me.voice.suppress) {
      if (newState.guild.members.me.permissions.has(["Connect", "Speak"]) || newState.channel?.permissionsFor(newState.guild.members.me)?.has("MuteMembers")) {
        await newState.guild.members.me.voice.setSuppressed(false).catch(() => { });
      }
    }
    if (newState.id == this.client.user.id) return;
    let vc = newState.guild.channels.cache.get(player.voiceId);

    if (newState.id === this.client.user.id && !newState.serverDeaf && vc && vc.permissionsFor(newState.guild.me).has("DeafenMembers")) await newState.setDeaf(true);
    if (newState.id === this.client.user.id && newState.serverMute && !player.paused) player.pause(true);
    if (newState.id === this.client.user.id && !newState.serverMute && player.paused) player.pause(false);

    const textChannel = newState.guild.channels.cache.get(player.textId);
    let voiceChannel = newState.guild.channels.cache.get(player.voiceId);

    if (newState.id === this.client.user.id && newState.channelId === null) return;

    if (oldState.id === this.client.user.id && newState.id === this.client.user.id && oldState.channelId !== newState.channelId) {
      if (player && player.voiceChannel !== newState.channelId) player.changeVoiceChannel(newState.channelId);
      voiceChannel = newState.guild.channels.cache.get(newState.channelId);
    };

    if (!voiceChannel) return;

    if (voiceChannel.members.filter((x) => !x.user.bot).size <= 0) {
      let data = await db.findOne({ _id: newState.guild.id });
      if (!data) {
        setTimeout(async () => {
          let playerVoiceChannel = newState.guild.channels.cache.get(player.voiceId);
          if (player && playerVoiceChannel && playerVoiceChannel.members.filter((x) => !x.user.bot).size <= 0) {
            if (textChannel && textChannel.permissionsFor(newState.guild.members.me).has("SendMessages") && textChannel.permissionsFor(newState.guild.members.me).has("ViewChannel") && textChannel.permissionsFor(newState.guild.members.me).has("EmbedLinks")) await oops(textChannel, `Leaving the voice channel due to inactivity.`);
            return player.destroy();
          }
        }, 60000);;
      } else {
        if (data.mode) return;
        setTimeout(async () => {
          let playerVoiceChannel2 = newState.guild.channels.cache.get(player.voiceId);
          if (player && playerVoiceChannel2 && playerVoiceChannel2.members.filter((x) => !x.user.bot).size <= 0) {
            if (textChannel && textChannel.permissionsFor(newState.guild.members.me).has("SendMessages") && textChannel.permissionsFor(newState.guild.members.me).has("ViewChannel") && textChannel.permissionsFor(newState.guild.members.me).has("EmbedLinks")) await oops(textChannel, `Leaving the voice channel due to inactivity.`);
            return player.destroy();
          }
        }, 60000);
      };
    };
  }
}
