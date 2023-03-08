const Command = require("../../structures/Command");
const db = require("../../schemas/247");
const { intReply } = require("../../handlers/functions");
const { EmbedBuilder } = require("discord.js")

module.exports = class TwentyFourSeven extends Command {
  constructor(client) {
    super(client, {
      name: "247",
      description: {
        content: "To enable/disable 24/7 mode.",
        usage: "247",
        examples: []
      },
      aliases: ["24/7", "24h"],
      category: "Settings",
      cooldown: 10,
      voteReq: true,
      player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks"],
        user: ["ManageGuild"],
      }
    })
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    let data = await db.findOne({ _id: interaction.guildId });
    let player = client.player.players.get(interaction.guildId);
    if (!data) {
      data = new db({
        _id: interaction.guildId,
        mode: true,
        textChannel: interaction.channelId,
        voiceChannel: interaction.member.voice.channelId,
        moderator: interaction.user.id,
        lastUpdated: Math.round(Date.now() / 1000)
      });
      await data.save();
      if (!player) player = await client.player.createPlayer({
        guildId: interaction.guildId,
        textId: interaction.channelId,
        voiceId: interaction.member.voice.channelId,
        deaf: true,
        shardId: interaction.guild.shardId,
      });
      const embed = new EmbedBuilder()
        .setColor(client.config.color)
        .setDescription(`${client.config.emojis.success} 24/7 mode is now **enabled**.`)
      return await intReply(interaction, ({ embeds: [embed] }));

    } else {
      if (data.mode) {
        data.mode = false;
        data.textChannel = null;
        data.voiceChannel = null;
        data.moderator = interaction.user.id;
        data.lastUpdated = Math.round(Date.now() / 1000);
        await data.save();
        const embed1 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} 24/7 mode is now **disabled**.`)
        return await intReply(interaction, ({ embeds: [embed1] }));
      } else {
        data.mode = true;
        data.textChannel = interaction.channelId;
        data.voiceChannel = interaction.member.voice.channelId;
        data.moderator = interaction.user.id;
        data.lastUpdated = Math.round(Date.now() / 1000);

        await data.save();
        if (!player) player = await client.player.createPlayer({
          guildId: interaction.guildId,
          textId: interaction.channelId,
          voiceId: interaction.member.voice.channelId,
          deaf: true,
          shardId: interaction.guild.shardId,
        });
        const embed2 = new EmbedBuilder()
          .setColor(client.config.color)
          .setDescription(`${client.config.emojis.success} 24/7 mode is now **enabled**.`)
        return await intReply(interaction, ({ embeds: [embed2] }));
      }
    }
  }
}