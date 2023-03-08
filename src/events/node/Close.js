const { WebhookClient, EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class NodeReconnect extends Event {
    constructor(...args) {
        super(...args);
    }
    async run(name, code, reason) {
        this.client.logger.info(`Lavalink node closed, code ${code}, reason ${reason || 'no reason'}`);
        let channel = new WebhookClient({ url: this.client.config.hooks.lavalink.url });
      const embed123 = new EmbedBuilder()
                .setColor("#ff0080")
                .setDescription(`**${name}** has been closed \ncode: ${code} \nreason: ${reason || 'no reason'}`)
        if (channel) return await channel.send({ embeds: [embed123] }).catch(() => { });
    }
}
