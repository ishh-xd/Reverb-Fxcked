const {
    model,
    Schema
} = require("mongoose");

module.exports = model("setup-schema", new Schema({
    _id: {
        type: String,
        required: true
    },

    channel: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    voiceChannel: {
        type: String,
        required: false,
        default: null
    },

    moderator: {
        type: String,
        required: true
    },

    lastUpdated: {
        type: String,
        default: new Date().getDate()
    },

    logs: {
        type: Array,
        default: null
    }
}));