"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const botLogSchema = new Schema({

    //  _id: ObjectId,
    type: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BotLog", botLogSchema);
