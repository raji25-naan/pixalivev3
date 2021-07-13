const mongoose = require("mongoose");
const { db_Chat } = require("../../db/database")
const chatSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  message: {
    type: String,
  },
  isDeletedbySender: {
    type: Boolean,
    default: false
  },
  isDeletedbyReceiver: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
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
  story_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  },
  created_at: {
    type: Date,
  },
});

module.exports = db_Chat.model("chat", chatSchema);
