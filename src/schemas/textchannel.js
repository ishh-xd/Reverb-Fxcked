const { Schema, model } = require("mongoose");

const guildSchema = new Schema({
  _id: { type: String },
  botChannel: { type: String, default: null }
});

module.exports = model("Guild", guildSchema);
