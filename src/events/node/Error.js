const { WebhookClient, EmbedBuilder } = require("discord.js");
const Event = require("../../structures/Event");

module.exports = class Error extends Event {
    constructor(...args) {
        super(...args);
    }
    async run(name, error) {
        this.client.logger.error(`Lavalink node ${name} Error: ${error}`);
        this.client.logger.error(error);
        let channel = new WebhookClient({ url: this.client.config.hooks.lavalink.url });
      const embed12 = new EmbedBuilder()
                .setColor("#ff0080")
                .setDescription(`An error occured with node **${name}** \n error message: ${error.message}!`)
        if (channel) return await channel.send({ embeds: [embed12] }).catch(() => { });
    }

}