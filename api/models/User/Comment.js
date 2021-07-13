const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")
const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Posts"
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  LikedUser:[
    {
      _id :{
       type : mongoose.Schema.Types.ObjectId,
       ref: "users"
      }
    }
  ],
  likeCount :{
    type : Number,
    default : 0
  },
  comment: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
  }
});

module.exports = db_Main.model("Comments", commentSchema);
