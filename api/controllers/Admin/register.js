const Admin_schema = require("../../models/Admin/register");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../../models/User/Users");
const Posts = require("../../models/User/Post");
const follow_unfollow = require("../../models/User/follow_unfollow");
const Like = require("../../models/User/like");
const Comment = require("../../models/User/Comment");

exports.signup = async (req, res) => {
  console.log(1);
  let { username, email, password } = req.body;
  const data = new Admin_schema({
    username: username,
    email: email,
    password: bcrypt.hashSync(password, 12),
    created_At: Date.now(),
  });
  const save = await data.save();
  return res.send(save);
};

//login
exports.login = async (req, res, next) => {
  try {
    let { username, password } = req.body;
    const data = await Admin_schema.findOne({ username }).exec();
    if (data) {
      const matched = await bcrypt.compare(password, data.password);
      if (!matched) {
        return res.json({
          success: false,
          message: "Invalid credentials!",
        });
      } else {
        const payload = {
          user: {
            id: data._id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });
        if (token) {
          return res.json({
            success: true,
            result: { data, token: token },
            message: "you have logged in successfully",
          });
        }
      }
    } else {
      return res.json({
        success: false,
        message: "you are not registered with us!",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    let getUserInfo = await Users.find()
    if (getUserInfo.length) {
      return res.json({
        success: true,
        result: getUserInfo,
      });
    } else {
      return res.json({
        success: false,
        result: "No data found",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    console.log(1)
    let userId = req.body.userId;
    console.log(userId)
    //ActivateUser
    const updateActivateUser = await Users.updateOne(
      { _id: userId },
      {
        $set: { isActive: true }
      },
      { new: true }
    ).exec();
    //ActivateUserPosts
    const updateActivateUserPosts = await Posts.updateMany(
      { user_id: userId },
      { $set: { isActive: true } },
      { new: true }
    );
    //reduceFollowingCount
    let totalFollower = await follow_unfollow.distinct("followerId", { followingId: userId, status: 1 }).exec();
    const increaseFollowingCount = await Users.updateMany(
      { _id: { $in: totalFollower } },
      { $inc: { followingCount: 1 } },
      { new: true }
    );
    //reduceFollowersCount
    let totalFollowing = await follow_unfollow.distinct("followingId", { followerId: userId, status: 1 }).exec();
    const increaseFollowersCount = await Users.updateMany(
      { _id: { $in: totalFollowing } },
      { $inc: { followersCount: 1 } },
      { new: true }
    );
    //reduceLikeCount
    let totalLike = await Like.distinct("post_id", { user_id: userId, isLike: 1 }).exec();
    const increaseLikeCount = await Posts.updateMany(
      { _id: { $in: totalLike } },
      { $inc: { likeCount: 1 } },
      { new: true }
    );
    // reduceCommentCount
    let totalComments = await Comment.distinct("post_id", { user_id: userId }).exec();
    const increaseCommentCount = await Comment.updateMany(
      { _id: { $in: totalComments } },
      { $inc: { commentCount: 1 } },
      { new: true }
    );
    console.log(increaseCommentCount)
    if (updateActivateUser && updateActivateUserPosts) {
      return res.json({
        success: true,
        result: "Successfully Activated",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    let userId = req.body.userId;
    //deactivateUser
    const updateDeactivateUser = await Users.updateOne(
      { _id: userId },
      {
        $set: { isActive: false }
      },
      { new: true }
    ).exec();
    //deactivateUserPosts
    const updateDeactivateUserPosts = await Posts.updateMany(
      { user_id: userId },
      { $set: { isActive: false } },
      { new: true }
    );
    //reduceFollowingCount
    let totalFollower = await follow_unfollow.distinct("followerId", { followingId: userId, status: 1 }).exec();
    const reduceFollowingCount = await Users.updateMany(
      { _id: { $in: totalFollower } },
      { $inc: { followingCount: -1 } },
      { new: true }
    );
    //reduceFollowersCount
    let totalFollowing = await follow_unfollow.distinct("followingId", { followerId: userId, status: 1 }).exec();
    const reduceFollowersCount = await Users.updateMany(
      { _id: { $in: totalFollowing } },
      { $inc: { followersCount: -1 } },
      { new: true }
    );
    //reduceLikeCount
    let totalLike = await Like.distinct("post_id", { user_id: userId, isLike: 1 }).exec();
    const reduceLikeCount = await Posts.updateMany(
      { _id: { $in: totalLike } },
      { $inc: { likeCount: -1 } },
      { new: true }
    );
    // reduceCommentCount
    let totalComments = await Comment.distinct("post_id", { user_id: userId }).exec();
    const reduceCommentCount = await Comment.updateMany(
      { _id: { $in: totalComments } },
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    if (updateDeactivateUser && updateDeactivateUserPosts) {
      return res.json({
        success: true,
        result: "Successfully Deactivated",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!",
    });
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    console.log(req.query.userId)
    const getUserInfo = await Users.findOne({ _id: req.query.userId });
    const post_countTrue = await Posts.find({ user_id: req.query.userId, isActive: true });
    const post_countfalse = await Posts.find({ user_id: req.query.userId, isActive: false });

    let ActiveCount = post_countTrue.length;
    let InActiveCount = post_countfalse.length;
    if (getUserInfo) {
      {
        return res.json({
          success: true,
          getUserInfo: getUserInfo,
          ActiveCount: ActiveCount,
          InActiveCount: InActiveCount,
          message: "Fetched successfully",
        });
      }
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
};
