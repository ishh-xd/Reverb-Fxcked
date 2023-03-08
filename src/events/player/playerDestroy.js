const { WebhookClient, EmbedBuilder } = require("discord.js");
const db = require("../../schemas/247");
const Event = require("../../structures/Event");
const { updateQueue } = require("../../handlers/functions");

module.exports = class playerDestroy extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {import('shoukaku').Player} player 
   * @returns 
   */
  async run(player) {

    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;
    this.client.logger.info(`Lavalink node ${player.node.name} Player destroyed in ${guild.name} [${guild.id}]`);
    let msg = await player.getNowplayingMessage();

    let data = await db.findOne({ _id: player.guildId });
    const web1 = new WebhookClient({ url: "https://discord.com/api/webhooks/996717215514632282/c0sc_rEMcwa5Euc27vvD41tEMQGTpa13GIIbExaBpn17dAZEM3G6g4QtZAj2SgDMlmI3" });
    const embed11 = new EmbedBuilder()

      .setDescription(`Player destroyed in **${guild.name ? guild.name : 'unknown'}** | **${guild?.id}**`)

    web1.send({ embeds: [embed11] })
    if (data && data.mode) {
      const channel = guild.channels.cache.get(player.textId);
      const vc = guild.channels.cache.get(data.voiceChannel);

      if (vc) {
        setTimeout(async () => {
          player = this.client.player.createPlayer({
            guildId: guild.id,
            textId: channel.id,
            voiceId: vc.id,
            deaf: true,
            shardId: guild.shardId,
          });

        }, 10000);
      };
    };
    await updateQueue(this.client, player, guild);
    let hook = new WebhookClient({ url: "https://discord.com/api/webhooks/996717215514632282/c0sc_rEMcwa5Euc27vvD41tEMQGTpa13GIIbExaBpn17dAZEM3G6g4QtZAj2SgDMlmI3" });
    const embed111 = new EmbedBuilder()
      .setDescription(`Player destroyed in **${guild.name ? guild.name : 'unknown'}** | **${guild?.id}**`)
    if (hook) await hook.send({ embeds: [embed111] }).catch(() => { });

  }

}

