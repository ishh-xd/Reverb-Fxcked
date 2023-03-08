const { PermissionFlagsBits } = require("discord.js");
const { oops, playerhandler } = require("../../handlers/functions");
const Event = require("../../structures/Event");

module.exports = class SetupSystem extends Event {
  constructor(...args) {
    super(...args);
     
  }
  async run(message) {
           let color = this.client.config.color ? this.client.config.color : "BLURPLE";
        if(!message.member.voice.channel) {
            await oops(message.channel, `You are not connected to a voice channel to queue songs.`, color);
            if(message) await message.delete().catch(() => {});
            return;
        };

        if(!message.member.voice.channel.permissionsFor(this.client.user).has([PermissionFlagsBits.Speak, PermissionFlagsBits.Connect])) {
            await oops(message.channel, `I don't have enough permission to connect/speak in ${message.member.voice.channel}`);
            if(message) await message.delete().catch(() => {});
            return;
        };

        if(message.guild.members.me.voice.channel && message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
            await oops(message.channel, `You are not connected to <#${message.guild.members.me.voice.channelId}> to queue songs`, color);
            if(message) await message.delete().catch(() => {});
            return;
        };
       
        let player = this.client.player.players.get(message.guildId);
        
        if(!player) player = this.client.player.createPlayer({
            guildId: message.guildId,
            textId: message.channelId,
            voiceId: message.member.voice.channelId,
            deaf: true,
        });

        await playerhandler(this.client, message.content, player, message, color);
        if(message) await message.delete().catch(() => {});
    }
}