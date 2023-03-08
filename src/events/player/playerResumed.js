const Event = require("../../structures/Event");
const { updateQueue } = require("../../handlers/functions");

module.exports = class PlayerResumed extends Event {
    constructor(...args) {
        super(...args);
    }
    async run(player) {
        let guild = this.client.guilds.cache.get(player.guildId);
        if (!guild) return;
        await updateQueue(this.client, player, guild);
        this.client.logger.info(`Lavalink node  ${player.node.name} Player resumed in ${guild.name} [${guild.id}] .`);
    }
}