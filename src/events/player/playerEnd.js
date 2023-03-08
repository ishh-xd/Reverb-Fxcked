const { updateQueue, autoplay } = require("../../handlers/functions");
const Event = require("../../structures/Event");

module.exports = class playerEnd extends Event {
    constructor(...args) {
        super(...args);
    }
    /**
     * 
     * @param {import('shoukaku').Player} player 
     * @returns 
     */
    async run(player) {
        let guild = this.client.guilds.cache.get(player.guildId);
        if (!guild) return;
        let channel = guild.channels.cache.get(player.textId);
        if (!channel) return;
        let msg = await player.getNowplayingMessage();
        if (msg) await msg.delete().catch(() => { });

        if (player.autoplay) {
            let track = player.queue.previous;
            if (!track) return;
            player.data.set("autoplay", track);
            await autoplay(player, this.client);
        }
        await updateQueue(this.client, player, guild);
    }
}