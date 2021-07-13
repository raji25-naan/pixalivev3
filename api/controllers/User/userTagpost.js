const Post = require('../../models/User/Post');
const TagPost = require('../../models/User/userTagpost');
const sleep = require('sleep-promise');


exports.tagged_post = async (req, res, next) => {
  try {
    const { userId } = req.user_id;
    const taggedPostId = await TagPost.distinct("post_id", { tagged_userId: userId }).exec();
    //getPosts
    const getPosts = await Post.find({ _id: taggedPostId, isActive: true }).exec();
    if (getPosts.length > 0) {
      return res.json({
        success: true,
        results: getPosts,
        message: "Tagged posts fetched successfully"
      })
    }
    else {
      return res.json({
        success: false,
        message: "No data found"
      })
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured", error
    })
  }
}
