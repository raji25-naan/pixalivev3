const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")


const blockschema = new mongoose.Schema({
    Blocked_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Blocked_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    created_at: {
        type: Date,
    },
})

module.exports = db_Main.model("blockschema", blockschema);