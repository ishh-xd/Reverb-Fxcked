const Event = require("../../structures/Event");
const db = require("../../schemas/setup");

module.exports = class MessageDelete extends Event {
    constructor(...args) {
        super(...args)
    }

    async run(message) {
        let data = await db.findOne({ Guild: message.guild.id });
        if (!data) return;
        if(data.message === message.id) {
            data.delete();
        }
    }
}