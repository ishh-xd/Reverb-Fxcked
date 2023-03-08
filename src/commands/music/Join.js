const Command = require('../../structures/Command');
const { intReply } = require("../../handlers/functions");
module.exports = class Join extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      description: {
        content: "Joins your voice channel.",
        usage: "",
        examples: []
      },
      category: "music",
      cooldown: 6,
      player: {
        voice: true,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: false,
        client: ["SendMessages", "ViewChannel", "EmbedLinks", "Connect", "Speak"],
        user: [],
      },

    })
  }
  async run(client, interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => { });
    let player = client.player.players.get(interaction.guildId);
    if (player && player.voiceChannel && player.state === "CONNECTED") {
      const embed = client.embed().setColor(client.config.color).setDescription(`I'm already connected to <#${player.voiceId}>`)
      return await intReply(interaction, { embeds: [embed] }).catch(() => { });
    }
    if (!player) player = client.player.createPlayer({
      guildId: interaction.guildId,
      textId: interaction.channelId,
      voiceId: interaction.member.voice.channelId,
      deaf: true,
      shardId: interaction.guild.shardId,
    });
    const embed1 = client.embed().setColor(client.config.color).setDescription(`Successfully joined <#${interaction.member.voice.channelId}>`);
    return await intReply(interaction, { embeds: [embed1] }).catch(() => { });
  }
}