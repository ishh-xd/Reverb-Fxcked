const { WebhookClient, EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class Disconnect extends Event {
    constructor(...args) {
        super(...args);
    }
    async run(name, players, moved) {
        if(moved) return;
        players.map(player => player.connection.disconnect());
        this.client.logger.warn(`Lavalink node ${name} disconnected.`);
      const embed23 = new EmbedBuilder()
                .setColor("#ff0080")
                .setDescription(`Node **${name}** has been disconnected`)
        let channel = new WebhookClient({ url: this.client.config.hooks.lavalink.url });
        if (channel) return await channel.send({ embeds: [embed23] }).catch(() => { });
    }
}