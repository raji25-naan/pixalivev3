const Story = require("../../models/User/story");
const moment = require("moment");
const follow_unfollow = require("../../models/User/follow_unfollow");
const momentTimeZone = require("moment-timezone");
const Users = require("../../models/User/Users");
const reportStory = require("../../models/User/reportStory");
const viewStory = require("../../models/User/viewStory");
const messageSchema = require('../../models/User/chat');
const user_chatSchema = require('../../models/User/user_chat');
const blocked_chatSchema = require('../../models/User/chat_blocked');
const sleep = require('sleep-promise');


exports.StoriesUpload = async (req, res, next) => {

  let userId = req.user_id;
  let { url } = req.body;
  const storyDisappearTime = moment().add(1, "d");
  const data = new Story({
    url: url,
    user_id: userId,
    storyDisappearTime: storyDisappearTime.toISOString(),
    isActive: true,
    created_at: Date.now()
  });
  const saveData = await data.save();
  if (saveData) {
    return res.json({
      success: true,
      message: "Stories uploaded successfully"
    });
  }
  else {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
}

//updateViewedStories
exports.updateViewedStories = async (req, res, next) => {

  let userId = req.user_id;
  let storyId = req.body.storyId;
  //findViewedUserId
  const findViewedUserId = await viewStory.findOne({
    storyId: storyId,
    viewed_userId: userId
  })
  if (findViewedUserId) {
    return res.json({
      success: false,
      message: "user already viewed this story"
    });
  }
  else {
    //updateView
    const update = new viewStory({
      storyId: storyId,
      viewed_userId: userId
    });
    const updateView = await update.save();
    //incViewCount
    const incViewCount = await Story.updateOne(
      { _id: storyId },
      {
        $inc: { viewedCount: 1 }
      },
      { new: true }
    ).exec();
    if (updateView && incViewCount) {
      return res.json({
        success: true,
        message: "Story viewed successfully"
      });
    }
  }
}

//getViewedUsersByStory
exports.getViewedUsersByStory = async (req, res, next) => {

  let storyId = req.query.storyId;
  let getUsers = await viewStory.distinct("viewed_userId", { storyId: storyId }).exec();
  //getUserDetails
  const getUserDetails = await Users.find({ _id: getUsers }, { _id: 1, username: 1, name: 1, avatar: 1 }).exec();
  if (getUserDetails) {
    return res.json({
      success: true,
      result: getUserDetails,
      message: "Successfully fetched"
    });
  }

}

exports.getStory = async (req, res, next) => {

  const user_id = req.user_id;
  const data_follower = await follow_unfollow.distinct("followingId", {
    followerId: user_id, status: 1
  })
  const all_ID = data_follower.map(String);
  const totalId = [...new Set(all_ID)];
  const array1 = [];
  const Stories = await Story.find({ user_id: totalId }).sort({ createdAt: -1 }).exec();
  Stories.forEach((values) => {
    array1.push(values.user_id)
  })
  const sortedstories = array1.map(String);
  const allstories = [...new Set(sortedstories)];
  //viewedDetails
  const viewedDetails = await viewStory.distinct("storyId", { viewed_userId: user_id })
  const allviewed = viewedDetails.map(String);
  const StoryViewed = [...new Set(allviewed)]
  //likedDetails
  const likedDetails = await Story.distinct("_id", { LikedUser: { _id: user_id } }).exec();
  const allLiked = likedDetails.map(String);
  const StoryLiked = [...new Set(allLiked)]
  var AllfriendStories = [];
  allstories.forEach(async (data) => {
    const friendsStories = await Story.find({
      $and: [{ user_id: data }, { isActive: true },
      { storyDisappearTime: { $gt: moment(momentTimeZone().tz('Asia/kolkata')).toDate() } }]
    }).populate("user_id", "username name private avatar").sort({ createdAt: 1 }).exec();
    if(friendsStories.length > 0)
    {
      AllfriendStories.push(friendsStories)
    }
    //viewed
    friendsStories.forEach((stories) => {
      StoryViewed.forEach((item) => {
        if (item == stories._id) {
          stories.viewed = 1
        }
      });
    });
    //isLiked
    friendsStories.forEach((stories) => {
      StoryLiked.forEach((item) => {
        if (item == stories._id) {
          stories.isLiked = 1
        }
      });
    });

  })
  if (AllfriendStories.length >= 0) {
    sleep(2000).then(function () {
      return res.json({
        success: true,
        result: AllfriendStories,
        message: "Story fetched successfully"
      })
    })
  }
  else {
    return res.json({
      success: true,
      result: AllfriendStories,
      message: "No stories"
    })
  }
}

//getStoryById
exports.getStoryById = async (req, res, next) => {

  const user_id = req.user_id;
  const userId = req.query.user_id;
  //viewedDetails
  const viewedDetails = await viewStory.distinct("storyId", { viewed_userId: user_id })
  const allviewed = viewedDetails.map(String);
  const StoryViewed = [...new Set(allviewed)]
  //likedDetails
  const likedDetails = await Story.distinct("_id", { LikedUser: { _id: user_id } }).exec();
  const allLiked = likedDetails.map(String);
  const StoryLiked = [...new Set(allLiked)]
  const Stories = await Story.find({
    $and: [{ user_id: userId }, { isActive: true },
    { storyDisappearTime: { $gt: moment(momentTimeZone().tz('Asia/kolkata')).toDate() } }]
  }).populate("user_id", "username name private avatar").sort({ created_at: 1 }).exec();
  if (Stories.length > 0) {
    //viewed
    Stories.forEach((data) => {
      StoryViewed.forEach((item) => {
        if (item == data._id) {
          data.viewed = 1
        }
      });
    });
    //isLiked
    Stories.forEach((data) => {
      StoryLiked.forEach((item) => {
        if (item == data._id) {
          data.isLiked = 1
        }
      });
    });
    return res.json({
      success: true,
      stories: Stories,
      message: "Story fetched successfully"
    })
  }
  else {
    return res.json({
      success: false,
      stories: Stories,
      message: "No stories found"
    })
  }
}

//getStoryByStoryId
exports.getStoryByStoryId = async (req, res, next) => {

  const user_id = req.user_id;
  const story_id = req.query.story_id
  //viewedDetails
  const viewedDetails = await viewStory.distinct("storyId", { viewed_userId: user_id })
  const allviewed = viewedDetails.map(String);
  const StoryViewed = [...new Set(allviewed)]
  //likedDetails
  const likedDetails = await Story.distinct("_id", { LikedUser: { _id: user_id } }).exec();
  const allLiked = likedDetails.map(String);
  const StoryLiked = [...new Set(allLiked)]
  const Stories = await Story.findOne({
    $and: [{ _id: story_id }, { isActive: true },
    { storyDisappearTime: { $gt: moment(momentTimeZone().tz('Asia/kolkata')).toDate() } }]
  }).populate("user_id", "username name private avatar").exec();
  if (Stories) {
    //viewed
    StoryViewed.forEach((item) => {
      if (item == story_id) {
        Stories.viewed = 1
      }
    });
    //isLiked
    StoryLiked.forEach((item) => {
      if (item == story_id) {
        Stories.isLiked = 1
      }
    });

    return res.json({
      success: true,
      stories: Stories,
      message: "Story fetched successfully"
    })
  }
  else {
    return res.json({
      success: false,
      message: "No stories found"
    })
  }
}

//deleteStory
exports.deleteStory = async (req, res, next) => {
  const story_id = req.body.story_id;
  const userStory = await Story.findByIdAndDelete({ _id: story_id }).exec();
  if (userStory) {
    return res.json({
      success: true,
      message: "Story Removed Successfully",
    });
  } else {
    return res.json({
      success: false,
      message: "Error occured! " + error,
    });
  }
};

//createStoryReport
exports.createStoryReport = async (req, res, next) => {
  const { story_id, report, user_id } = req.body;
  const reports = new reportStory({
    story_id: story_id,
    reportedByid: user_id,
    report: report
  });
  const saveReport = await reports.save();
  if (saveReport) {
    return res.json({
      success: true,
      message: "Reported successfully",
    });
  } else {
    return res.json({
      success: false,
      message: "Error occured!" + error,
    });
  }
};

//addLiketoStory
exports.addLiketoStory = async (req, res, next) => {

  const user_id = req.user_id;
  const story_id = req.body.story_id;

  if (req.body.type == 1) {
    //checkAlreadyLiked
    const checkAlreadyLiked = await Story.findOne({ _id: story_id, LikedUser: { _id: user_id } }).exec();
    if (checkAlreadyLiked == null) {
      const addlike = await Story.findByIdAndUpdate(
        { _id: story_id },
        {
          $push: {
            "LikedUser": {
              _id: user_id,
            }
          }
        }, { new: true }).exec();

      const increaseLikeCount = await Story.updateOne(
        { _id: story_id },
        { $inc: { likeCount: 1 } },
        { new: true });

      if (increaseLikeCount && addlike) {
        return res.json({
          success: true,
          message: 'successfully Liked'
        })
      }
      else {
        return res.json({
          success: false,
          message: 'error occured'
        })
      }

    }
    else {
      return res.json({
        success: false,
        message: "Already liked this story"
      })
    }
  }
  else if (req.body.type == 0) {
    //checkAlreadyLiked
    const checkAlreadyLiked = await Story.findOne({ _id: story_id, LikedUser: { _id: user_id } }).exec();
    if (checkAlreadyLiked !== null) {
      const unlike = await Story.findByIdAndUpdate(
        { _id: story_id },
        {
          $pull: {
            "LikedUser": {
              _id: user_id,
            }
          }
        }, { new: true });

      const decreaseLikeCount = await Story.updateOne(
        { _id: story_id },
        { $inc: { likeCount: -1 } },
        { new: true }
      );
      if (unlike && decreaseLikeCount) {
        return res.json({
          success: true,
          message: "Unlike successfully"
        })
      } else {
        return res.json({
          success: false,
          message: "Error occured"
        })
      }
    }
    else {
      return res.json({
        success: false,
        message: "You are not liked this story"
      })
    }
  }
}

// story comment


exports.commentstory = async (req, res, next) => {
  const userID = req.user_id;
  const story_id = req.body.story_id;
  const receiverId = req.body.receiver_id;
  const senderId = req.body.sender_id;
  const message = req.body.message;
  const url = req.body.url;
  const post_type = req.body.post_type;
  const thumbnail = req.body.thumbnail;

  // find blocked User

  const user_blockList = await blocked_chatSchema.findOne({ user_id: senderId })
  if (user_blockList) {

    var arr = []
    if (user_blockList.BlockedByuser_IDs.length || user_blockList.BlockedTheUser_IDs.length) {
      var user_blockData = user_blockList.BlockedByuser_IDs
      user_blockData.forEach(val => {
        arr.push(val.user_id)
      })
      var user_blockInData = user_blockList.BlockedTheUser_IDs
      user_blockInData.forEach(val => {
        arr.push(val.user_id)
      })
    }
    if (arr.length) {
      var change_string = arr.toString();
      if (change_string.includes(receiverId.toString())) {
        const updateSchema = chatUpdateBlock(senderId, receiverId, message, url, post_type, thumbnail,story_id);
        const update_userChatBlocked = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
      }
      else {
        if (userID.toString() == senderId.toString()) {
          const updateSchemaChat3 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail,story_id);
          const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
          const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
        }
        if (userID.toString() == receiverId.toString()) {
          const updateSchemaChat2 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail,story_id);
          const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
          const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

        }
      }
      return res.json({
        success: true,
        message: 'successfully commented'
      })
    }
    else {
      const updateSchemaChat1 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail,story_id);
      if (userID.toString() == senderId.toString()) {
        const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
        const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
      }
      if (userID.toString() == receiverId.toString()) {
        const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
        const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

      }
    }
  }
  else {

    const updateSchemaChat = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail,story_id);
    if (userID.toString() == senderId.toString()) {
      const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
      const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
    }
    if (userID.toString() == receiverId.toString()) {
      const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
      const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

    }
    // increase count

    const increaseLikeCount = await Story.updateOne(
      { _id: story_id },
      { $inc: { commentCount: 1 } },
      { new: true }
    );
    if (increaseLikeCount) {
      return res.json({
        success: true,
        message: 'successfully commentedmain'
      })
    }
  }

}


async function chatUpdateBlock(senderId, receiverId, message, url, post_type, thumbnail,story_id) {
  var create_mge = await new messageSchema({
    sender_id: senderId,
    receiver_id: receiverId,
    message: message,
    story_id: story_id,
    url: url,
    thumbnail: thumbnail,
    post_type: post_type,
    isBlocked: true,
    created_at: Date.now(),
  }).save();
}

async function chatUpdate(senderId, receiverId, message, url, post_type, thumbnail,story_id) {
  // Insert message into database

  var create_mge = await new messageSchema({
    sender_id: senderId,
    receiver_id: receiverId,
    message: message,
    url: url,
    story_id: story_id,
    thumbnail: thumbnail,
    post_type: post_type,
    created_at: Date.now(),
  }).save();
}

async function updateUserChat(type, userId, receiverId, message, url, post_type, thumbnail) {
  var find_user = await user_chatSchema.find({ user_id: userId });
  if (find_user.length) {
    console.log("hi")

    const unfollow = await user_chatSchema.updateOne(
      { user_id: userId },
      {
        $pull: {
          "user_data": {
            user_id: userId,
            receiver_id: receiverId,
          }
        }
      }, { new: true }
    ).exec();

    if (unfollow) {
      if (type == 0) {
        const user_follow = await user_chatSchema.updateOne(
          { user_id: userId },
          {
            $push: {
              "user_data": {
                user_id: userId,
                receiver_id: receiverId,
                user_message: message,
                url: url,
                thumbnail: thumbnail,
                post_type: post_type,
                created_at: Date.now(),
              }
            }
          }, { new: true }
        ).exec();
      }
      else if (type == 1) {
        const receiver_follow = await user_chatSchema.updateOne(
          { user_id: userId },
          {
            $push: {
              "user_data": {
                user_id: userId,
                receiver_id: receiverId,
                receiver_message: message,
                url: url,
                thumbnail: thumbnail,
                post_type: post_type,
                created_at: Date.now(),
              }
            }
          }, { new: true }
        ).exec();
      }

    }
  }
  else {
    console.log("hello")
    if (type == 0) {
      var create_newuser = new user_chatSchema({
        user_id: userId,
        user_data: [
          {
            user_id: userId,
            receiver_id: receiverId,
            user_message: message,
            url: url,
            thumbnail: thumbnail,
            post_type: post_type,
            created_at: Date.now(),
          },
        ]
      })
      const saveData = await create_newuser.save();
    }
    else if (type == 1) {
      var create_newuser1 = new user_chatSchema({
        user_id: userId,
        user_data: [
          {
            user_id: userId,
            receiver_id: receiverId,
            receiver_message: message,
            url: url,
            thumbnail: thumbnail,
            post_type: post_type,
            created_at: Date.now(),
          },
        ]
      })
      const saveDataOne = await create_newuser1.save();
    }

  }
}