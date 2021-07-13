const mongoose = require("mongoose");
const moment = require("moment");
const { db_Main } = require("../../db/database")

const story = new mongoose.Schema({

  url: {
    type: String,
    default: ''
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  storyDisappearTime: {
    type: Date,
    default: moment().add(1, 'd').toDate()
  },
  LikedUser: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  likeCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  isLiked: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  viewedCount: {
    type: Number,
    default: 0
  },
  viewed: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date
  },

}, { timestamps: true });

story.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = db_Main.model("stories", story);
