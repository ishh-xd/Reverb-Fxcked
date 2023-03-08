const Event = require("../../structures/Event");
const { updateQueue } = require("../../handlers/functions");
const db = require("../../schemas/247");

module.exports = class playerEmpty extends Event {
  constructor(...args) {
    super(...args);
  }
  /**
   * 
   * @param {import('shoukaku').Player} player 
   * @returns 
   */
  async run(player) {
    const color = this.client.config.color ? this.client.config.color : "BLURPLE";
    let guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;
    let channel = guild.channels.cache.get(player.textId);
    if (!channel) return;
    let msg = await player.getNowplayingMessage();

    const trackButton = this.client.button().setCustomId(`END_PREVIOUS`).setLabel("Add the previous track to the queue").setStyle(3)
    const inv = this.client.button().setLabel("Invite").setURL(this.client.config.links.invite).setStyle(5);
    const vote = this.client.button().setLabel("Vote").setURL(this.client.config.botlist.topgg).setStyle(5);
    const row = this.client.raw().addComponents([trackButton, inv, vote]);
    let desc = `Enjoying **${this.client.user.username}**? Then consider voting me on [Top.gg](${this.client.config.botlist.topgg}) to help us grow!`;
    let desc2 = `<:musicalnote2:981955432526520351> Queue has ended! There is no more music to play. Enjoying the music? consider voting me on [Top.gg](${this.client.config.botlist.topgg})`

    let embed = this.client.embed()
      .setColor(color ? color : "#59D893")

    await updateQueue(this.client, player, guild);
    let data = await db.findOne({ _id: player.guildId });
    if (data && data.mode) {

    } else {
      if (player.queue.previous) {
        if (msg && msg.editable) await msg.reply({
          embeds: [embed.setDescription(desc2)],
          components: [row]
        }).catch(() => { });
      } else {
        setTimeout(async () => {
          if (player && !player.queue.current) {
            if (msg && msg.editable) await msg.reply({
              embeds: [embed.setDescription(desc)],
            }).catch(() => { });
            if (player && !player.playing && !player.paused) {
              player.destroy();
            }
          }
        }, 60000)
      }

    }
  }
}
