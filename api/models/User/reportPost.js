const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const reports = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
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

module.exports = db_Main.model("reports", reports)