const mongoose = require("mongoose");
const { db_Chat } = require("../../db/database")
const user_chatSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId },
    user_data: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId },
            receiver_id: { type: mongoose.Schema.Types.ObjectId },
            user_message: { type: String },
            receiver_message: { type: String },
            url: {
                type: String,
                default: ""
            },
            post_type: {
                type: Number
            },
            thumbnail: {
                type: String,
                default: ""
            },
            created_at: { type: Date, },
        },
    ],
});

module.exports = db_Chat.model("chat_user", user_chatSchema);