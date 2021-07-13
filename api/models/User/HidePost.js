const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const hidepost = new mongoose.Schema({

    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
    },
    hideByid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    created_at:{
        type:Date,
        default: Date.now()
    }
});

module.exports = db_Main.model("hideposts", hidepost)