const Event = require("../../structures/Event");
const clusterMessage = require("./clusterMessage");
const { WebhookClient } = require('discord.js');
const config = require("../../config");
module.exports = class clusterCreate extends Event {
    constructor(...args) {
        super(...args)
    }
    async run(cluster, manager, logger) {
        logger.info(`Shard #${cluster.id} Created`)
        let hook = new WebhookClient({ url: config.hooks.event.url });
        if (hook) return await hook.send({ content: `[Client] => Shard #${cluster.id} Created` }).catch(() => { });
        cluster.on("message", async (message) => (new clusterMessage(this, clustershardMessage)).run(message, manager, logger))
    }
}   