const { WebhookClient } = require('discord.js');
const Event = require("../../structures/Event");

module.exports = class ShardReconnecting extends Event {
    constructor(...args) {
        super(...args)
    }
    async run(id) {

        this.client.logger.warn(`Shard #${id} Reconnecting`)
        let hook = new WebhookClient({ url: this.client.config.hooks.event.url });
        if (hook) return await hook.send({ content: `[Client] => Shard #${id} Reconnecting` }).catch(() => { });

    }
}