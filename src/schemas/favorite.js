const { Schema, model } = require("mongoose");

module.exports = model("favi", new Schema({
    _id: {
        type: String,
        required: true
    },

    songs: {
        type: Array,
        required: true,
        Default: null
    }
}));