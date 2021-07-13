const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const viewStory = new mongoose.Schema({

  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stories"
  },
  viewed_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  created_At: {
    type: Date,
    default: Date.now()
  }
});

module.exports = db_Main.model("viewstories", viewStory);