const { Schema, model } = require("mongoose");

const premiumCode = new Schema({
    code: {
        type: String,
        default: null
    },
    plan: {
        type: String,
        default: null
    },
    times: {
        type: Number,
        default: null
    },
    expireTime: {
        type: Number,
        default: null
    },
    expireAt: {
        type: Date,
        default: null
    },
})

module.exports = model('premium-codes', premiumCode); {
    const models = model('premium-codes', premiumCode);
    models.collection.createIndex({ expireTime: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
    return models;
}
