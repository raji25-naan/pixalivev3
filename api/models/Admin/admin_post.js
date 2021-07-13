const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const admin_postSchema = new mongoose.Schema({
    url: {
        type: String
    },
    text_content: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    post_type: {
        type: Number,
    },
    body: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "registers"
    },
    place: {
        type: String,
    },
    created_at: {
        type: Date,
    },
    likeCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0
    },
    hashtag: {
        type: Array,
    },
    lat: {
        type: String,
        default: ""
    },
    lng: {
        type: String,
        default: ""
    },
    category: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isLiked: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ""
    }
});

module.exports = db_Main.model("admin_Posts", admin_postSchema);
