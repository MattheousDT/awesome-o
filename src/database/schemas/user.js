"use strict";

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({

    //  _id: ObjectId,
    discordId: { type: String, required: true, unique: true },

    scriptData: [{
        index: false
    }]
});

module.exports = mongoose.model("User", userSchema);
