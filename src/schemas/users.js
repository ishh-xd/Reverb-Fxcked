const { model, Schema } = require("mongoose");

module.exports = model("users-schema", new Schema({
    _id: {
        type: String,
        required: true
    },

    userName: {
        type: String,
        required: true
    },

    userTag: {
        type: String,
        default: null
    },

    commandsRan: {
        type: String,
        default: "0"
    },

    songsRan: {
        type: String,
        default: "0"
    }
}));