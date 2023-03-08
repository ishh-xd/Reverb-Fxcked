const Event = require("../../structures/Event");
const { updateQueue } = require("../../handlers/functions");

module.exports = class PlayerException extends Event {
    constructor(...args) {
        super(...args);
    }
    async run(player, data) {
        let guild = this.client.guilds.cache.get(player.guildId);
        if (!guild) return;
        await updateQueue(this.client, player, guild);
        this.client.logger.info(`Lavalink node  ${player.node.name} Player exception ${data}.`);
    }
}