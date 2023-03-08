const { WebhookClient } = require('discord.js');
const Event = require("../../structures/Event");

module.exports = class ShardReady extends Event {
    constructor(...args) {
        super(...args)
    }
    async run(id) {
        this.client.logger.ready(`Shard #${id} Ready`)
            let hook = new WebhookClient({ url: this.client.config.hooks.event.url });
            if (hook) return await hook.send({ content: `[Client] => Shard #${id} Ready` }).catch(() => { });
    
        }
}