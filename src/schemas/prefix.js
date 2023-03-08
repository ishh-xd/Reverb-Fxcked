const { model, Schema } = require("mongoose");
module.exports = model("prefix-schema", new Schema({
    _id: {
        type: String,
        required: true
    },
    prefix: {
        type: String,
        required: true
    },
    oldPrefix: {
        type: String,
        required: true
    },
    moderator: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: String,
        default: new Date().getDate()
    }
}))