const { model, Schema } = require("mongoose");

module.exports = model("bot", new Schema({
    _id: {
        type: String,
        required: true
    },
    songLove: {
        type: Number,
        default: 0
    },
    songHate: {
        type: Number,
        default: 0
    },
    songLoveList: {
        type: Array,
        default: []
    },

}));
