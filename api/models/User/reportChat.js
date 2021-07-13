const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const reportchat = new mongoose.Schema({

    reported_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    reportedByid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    report: {
        type: String,
        default: ""
    },
    created_at: {
        type : Date,
        default: Date.now()
    }
});

module.exports = db_Main.model("reportchats", reportchat)