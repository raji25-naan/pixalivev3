const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const reportStory = new mongoose.Schema({

    story_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stories"
    },
    reportedByid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    report: {
        type: String,
        default: ""
    }
});

module.exports = db_Main.model("reportstories", reportStory)