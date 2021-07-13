const mongoose = require("mongoose");
const { db_Chat } = require("../../db/database")
const Block_userChatSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId },
    BlockedByuser_IDs: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId },
            created_at: { type: Date, },
        },
    ],
    BlockedTheUser_IDs: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId },
            created_at: { type: Date, },
        },
    ],
})

module.exports = db_Chat.model("Block_chat", Block_userChatSchema);
