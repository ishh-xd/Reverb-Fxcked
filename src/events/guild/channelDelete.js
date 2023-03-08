const Event = require("../../structures/Event");
const db = require("../../schemas/setup");

module.exports = class ChannelDelete extends Event {
    constructor(...args) {
        super(...args)
    }
    async run(channel) {
        if (channel.type === 2) {
            if (channel.members.has(this.client.user.id)) {
                const player = this.client.players.get(channel.guild.id);
                if (player) {
                    if (channel.id === player.voiceChannel) {
                        player.destroy();
                    }
                }
            }
        }
        if (channel.type === 0) {
            let data = await db.findOne({ Guild: channel.guild.id });
            if (!data) return;
            if (data.channel === channel.id) {
                data.delete();
            }
        }
    }
}