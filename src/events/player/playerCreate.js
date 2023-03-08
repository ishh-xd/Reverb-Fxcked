const { WebhookClient, EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");
const { updateQueue } = require("../../handlers/functions");

module.exports = class PlayerCreate extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {import('shoukaku').Player} player 
   * @returns 
   */
  async run(player) {
    let guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;

    this.client.logger.info(`Lavalink node  ${player.node.name} Player created in ${guild.name} [${guild.id}] .`);
    await updateQueue(this.client, player, guild);

    player.setVolume(80)

    let hook = new WebhookClient({ url: this.client.config.hooks.lavalink.url });
    const embed12 = new EmbedBuilder()
      .setColor("#ff0080")
      .setDescription(`Player created with node **${player.node.name}** in ${guild.name} | ${guild.id}`)
    if (hook) await hook.send({ embeds: [embed12] }).catch(() => { });
  }
}
