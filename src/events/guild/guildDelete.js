const { WebhookClient, EmbedBuilder } = require("discord.js");
const setup = require("../../schemas/setup");
const guilds = require("../../schemas/guilds");
const dj = require("../../schemas/dj");
const announce = require("../../schemas/announce");
const _247 = require("../../schemas/247");
const prefix = require("../../schemas/prefix");
const Event = require("../../structures/Event");
const Command = require('../../structures/Command');
const { convertHmsToMs, NumberToBNH } = require("../../utils/convert");
const { intReply } = require('../../handlers/functions');

module.exports = class GuildDelete extends Event {
  constructor(...args) {
    super(...args)
  }
  async run(guild, client, interaction) {

    let data1, data2, data3, data4, data5, data6;

    data1 = await setup.findOne({ _id: guild.id });
    data2 = await guilds.findOne({ _id: guild.id });
    data3 = await dj.findOne({ _id: guild.id });
    data4 = await announce.findOne({ _id: guild.id });
    data5 = await _247.findOne({ _id: guild.id });
    data6 = await prefix.findOne({ _id: guild.id });

    if (data1) await data1.delete();
    if (data2) await data2.delete();
    if (data3) await data3.delete();
    if (data4) await data4.delete();
    if (data5) await data5.delete();
    if (data6) await data6.delete();

    let hook = new WebhookClient({ url: this.client.config.hooks.guildRemove.url });
    if (!hook) return;

    const embed = new EmbedBuilder()
      .setThumbnail(guild?.iconURL({}))
      .setTitle(`Left a Guild`)
      .setColor("#ff0080")
      .addFields([
        {
          name: "Created On",
          value: `<t:${Math.round(guild?.createdTimestamp / 1000)}>`,
          inline: false
        },
        {
          name: "Added On",
          value: `<t:${Math.round(Date.now() / 1000)}>`,
          inline: false
        },
        {
          name: "Guild Id",
          value: `\`${guild?.id}\``,
          inline: false
        },
        {
          name: "Owner",
          value: `<@${guild?.ownerId}> (\`id: ${guild?.ownerId}\`)`,
          inline: false
        },
        {
          name: "Total Members Count",
          value: `**${guild?.memberCount}**`,
          inline: false
        }
      ]);

    return await hook.send({ embeds: [embed] }).catch(() => { });

  }
}