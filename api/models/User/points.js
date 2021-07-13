const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const points = new mongoose.Schema({

  _id : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
  },
  post_Points : {
      type: Number,
      default: 0
  },
  reloop_Points : {
    type: Number,
    default: 0
  },
  share_Points : {
    type: Number,
    default: 0
  },
  total_Points : {
    type: Number,
    default: 0
  }

});

points.pre('save',function(next){
    this.total_Points = this.post_Points + this.reloop_Points + this.share_Points;
    next();
})

module.exports = db_Main.model("points", points);
