const { model, Schema } = require("mongoose");

module.exports = model("guilds_schema", new Schema({
    _id: {
        type: String,
        required: true
    },

    commandsRan: {
        type: String,
        default: "0"
    },

    songsRan: {
        type: String,
        default: "0"
    },
    botChannel: {
        type: String,
        default: null
    }
}));