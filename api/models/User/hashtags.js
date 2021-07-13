const mongoose = require("mongoose");
const { db_Main } = require("../../db/database");
const hashtag = new mongoose.Schema({

  hashtag: {
    type: String
  },
  followerCount: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date
  },
  follow: {
    type: Number,
    default: 0
  },
  posts: {
    type: Number,
    default: 0
  }
});

module.exports = db_Main.model("hashtags", hashtag);
