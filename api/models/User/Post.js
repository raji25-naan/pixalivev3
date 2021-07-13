const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const postSchema = new mongoose.Schema({
  url: {
    type: String,
    default: ""
  },
  text_content: {
    type: String
  },
  thumbnail: {
    type: String
  },
  post_type: {
    type: Number
  },
  body: {
    type: String
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  created_at: {
    type: Date
  },
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  hashtag: {
    type: Array
  },
  place: {
    type: String,
    default: ""
  },
  category: [],
  isActive: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isLiked: {
    type: Number,
    default: 0
  },
  privacyType: {
    type: String,
    default: ""
  },
  tagged_userId: [],
  reloopPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  reloopCount: {
    type: Number,
    default: 0
  },
  encryptId: {
    type: String,
    default: ""
  }

});

module.exports = db_Main.model("Posts", postSchema);
