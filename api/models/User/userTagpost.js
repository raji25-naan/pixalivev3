const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const taggedPost = new mongoose.Schema({

  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  tagged_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  taggedByuserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  created_at: {
    type: Date,
    default : Date.now()
  }
});

module.exports = db_Main.model("taggedPost", taggedPost);
