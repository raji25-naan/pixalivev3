const postSchema = require("../../models/User/Post");
const viewPost = require("../../models/User/viewPost");
const hashtagSchema = require("../../models/User/hashtags");
const reportPost = require("../../models/User/reportPost");
const follow_unfollow = require("../../models/User/follow_unfollow");
const likeSchema = require("../../models/User/like");
const jwt = require("jsonwebtoken");
const sleep = require('sleep-promise');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
const userTagpost = require("../../models/User/userTagpost");
const hidePostSchema = require("../../models/User/HidePost");
const { increasePost_Point, increaseReloop_Point } = require("./points");
const blocked = require("../../models/User/blocked");

// ************* Create post Using user_Id ***************//

exports.create_postNew = async (req, res, next) => {

  const { text, url, body, thumbnail, type, privacyType, tagged_userId, category } = req.body;
  const user_id = req.user_id;
  let place;
  if (req.body.place) {
    place = req.body.place.toLowerCase();
  }
  //hashSplit
  let arr_hash;
  if (body) {
    arr_hash = body.match(/(^|\s)#(\w+)/g);
    console.log(arr_hash);
  }
  var hash_tag = [];
  if (arr_hash) {
    console.log(arr_hash);
    arr_hash = arr_hash.map(function (v) {
      return v.trim().substring(1);
    });
    hash_tag.push(...arr_hash);
    const get_hashtag = await hashtagSchema.distinct("hashtag", {
      hashtag: arr_hash,
    });
    console.log(get_hashtag);
    hash_tags = new Set(get_hashtag.map((tag) => tag));

    arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

    console.log(arr_hash);

    arr_hash.forEach(async (element) => {
      const hashtag = new hashtagSchema({
        hashtag: element,
        created_at: new Date(),
      }).save();
    });
  }


  if (type == 1 || type == 2 || type == 3)
    update_postwithType(
      user_id,
      url,
      "",
      thumbnail,
      body,
      place,
      type,
      hash_tag,
      privacyType,
      tagged_userId,
      category,
      res
    );
  if (type == 4)
    update_postwithType(
      user_id,
      "",
      text,
      thumbnail,
      body,
      place,
      type,
      hash_tag,
      privacyType,
      tagged_userId,
      category,
      res
    );
};

async function update_postwithType(
  userId,
  url,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  privacyType,
  tagged_userId,
  category,
  res
) {
  try {
    const createdPost = await new postSchema({
      user_id: userId,
      url: url,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hashtag: hashtag,
      privacyType: privacyType,
      tagged_userId: tagged_userId,
      category: category,
      isActive: true,
      created_at: Date.now(),
    }).save();

    if (createdPost) {
      let userId = createdPost.user_id;
      let postId = createdPost._id;
      let encryptdId = cryptr.encrypt(postId)
      const updateEncryptId = await postSchema.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { encryptId: encryptdId }
        },
        { new: true }
      ).exec();


      increasePost_Point(userId);
      if (tagged_userId.length > 0) {
        tagged_userId.forEach(async (element) => {

          const saveTagged = new userTagpost({
            post_id: createdPost._id,
            tagged_userId: element,
            taggedByuserId: createdPost.user_id
          });
          await saveTagged.save();
        })
      }

      return res.json({
        success: true,
        result: createdPost,
        message: "Post added successfully"
      });
    }
    else {
      return res.json({
        success: false,
        message: "Error adding post" + error,
      });
    }

  } catch (error) {
    return res.json({
      success: false,
      message: "Error adding post" + error,
    });
  }
}

//reloopPost
exports.reloopPost = async (req, res, next) => {

  const { text, url, body, thumbnail, type, privacyType, category } = req.body;
  const user_id = req.user_id;
  let reloopPostId = req.body.post_id;
  //checkIspublic
  const checkIspublic = await postSchema.findOne({ _id: reloopPostId }).exec();
  if (checkIspublic.privacyType == "public") {
    let place;
    if (req.body.place) {
      place = req.body.place.toLowerCase();
    }
    //hashSplit
    let arr_hash;
    if (body) {
      arr_hash = body.match(/(^|\s)#(\w+)/g);
      console.log(arr_hash);
    }
    var hash_tag = [];
    if (arr_hash) {
      arr_hash = arr_hash.map(function (v) {
        return v.trim().substring(1);
      });
      hash_tag.push(...arr_hash);
      const get_hashtag = await hashtagSchema.distinct("hashtag", {
        hashtag: arr_hash,
      });
      hash_tags = new Set(get_hashtag.map((tag) => tag));

      arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

      arr_hash.forEach(async (element) => {
        const hashtag = new hashtagSchema({
          hashtag: element,
          created_at: new Date(),
        }).save();
      });
    }

    if (type == 1 || type == 2 || type == 3)
      updateReloopwithPostType(
        user_id,
        url,
        "",
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        privacyType,
        reloopPostId,
        category,
        res
      );
    if (type == 4)
      updateReloopwithPostType(
        user_id,
        "",
        text,
        thumbnail,
        body,
        place,
        type,
        hash_tag,
        privacyType,
        reloopPostId,
        category,
        res
      );
  }
  else {
    return res.json({
      success: false,
      message: "This is not a public post!You cant reloop"
    });
  }

}

async function updateReloopwithPostType(
  userId,
  url,
  text,
  thumbnail,
  body,
  place,
  type,
  hashtag,
  privacyType,
  reloopPostId,
  category,
  res
) {
  try {
    const createdReloop = await new postSchema({
      user_id: userId,
      url: url,
      text_content: text,
      thumbnail: thumbnail,
      body: body,
      place: place,
      post_type: type,
      hashtag: hashtag,
      privacyType: privacyType,
      reloopPostId: reloopPostId,
      category: category,
      isActive: true,
      created_at: Date.now(),
    }).save();

    if (createdReloop) {
      //updateReloopCount

      let postId = createdReloop._id;
      let encryptdId = cryptr.encrypt(postId)
      const updateEncryptId = await postSchema.findOneAndUpdate(
        { _id: postId },
        {
          $inc: { encryptId: encryptdId }
        },
        { new: true }
      ).exec();

      const updateReloopCount = await postSchema.findOneAndUpdate(
        { _id: reloopPostId },
        {
          $inc: { reloopCount: 1 }
        },
        { new: true }
      ).exec();

      if (updateReloopCount) {
        let userId = updateReloopCount.user_id;
        increaseReloop_Point(userId);
        return res.json({
          success: true,
          result: createdReloop,
          message: "Relooped successfully"
        });
      }
    }
    else {
      return res.json({
        success: false,
        message: "Error occured in reloop " + error
      });
    }
  }
  catch (error) {
    return res.json({
      success: false,
      message: "Error occured! " + error
    });
  }

}

// ************* Get post Using Post_id ***************//
exports.get_post = async (req, res, next) => {

  const user_id = req.user_id;
  console.log(user_id);
  const post_id = req.query.post_id;

  const all_Posts = await postSchema.findOne({ _id: post_id, isActive: true, isDeleted: false }).populate("user_id", "username avatar name private follow").exec();
  if (all_Posts) {
    //data_follower
    const data_follower = await follow_unfollow.distinct("followingId", {
      followerId: user_id, status: 1
    });
    var array1 = data_follower.map(String);
    var getAllId = [...new Set(array1)];
    //data_request
    const data_request = await follow_unfollow.distinct("followingId", {
      followerId: user_id, status: 0
    });
    var array2 = data_request.map(String);
    var requested = [...new Set(array2)];
    //follow1
    getAllId.forEach((followId) => {
      if (followId == all_Posts.user_id._id) {
        all_Posts.user_id.follow = 1;
      }
    });
    //follow2
    requested.forEach((followId) => {
      if (followId == all_Posts.user_id._id) {
        all_Posts.user_id.follow = 2;
      }
    });
    //get_like
    let get_like = await likeSchema.distinct("post_id", {
      user_id: user_id,
      isLike: 1,
    }).exec();
    console.log(get_like);
    let likedIds = get_like.map(String);
    likedIds.forEach((id) => {
      if (id == all_Posts._id) {
        all_Posts.isLiked = 1;
      }
    });

    sleep(2000).then(function () {
      return res.json({
        success: true,
        post: all_Posts
      });
    });
  }
  else {
    return res.json({
      success: false,
      message: "Post not available"
    });
  }
};


// Get user feeds using user_id and fix offset
exports.feeds = async (req, res, next) => {
  const user_id = req.user_id;
  //data_follower
  const data_follower = await follow_unfollow.distinct("followingId", { followerId: user_id, status: 1 }).exec();
  const stringFollowerId = data_follower.map(String);
  data_follower.push(user_id);
  var array1 = data_follower.map(String);
  var getAllId = [...new Set(array1)];
  //data_request
  const data_request = await follow_unfollow.distinct("followingId", { followerId: user_id, status: 0 }).exec();
  var array2 = data_request.map(String);
  var requested = [...new Set(array2)];
  //getReloopPostIdswithoutBody
  let reloopPostIds = await postSchema.distinct("reloopPostId", { user_id: getAllId }).exec();
  let relooppostIdsWithoutbody = await postSchema.distinct("_id", { user_id: getAllId, reloopPostId: reloopPostIds, body: "" }).exec();

  //getHidePost
  let getHidePost = await hidePostSchema.distinct("post_id", { hideByid: user_id }).exec();
  let totalHideandBlockPostId = relooppostIdsWithoutbody.concat(getHidePost);
  //getBlockedUsers
  let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
  let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
  let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);

  const all_feeds = await postSchema
    .find({
      user_id: { $in: getAllId, $nin: totalBlockedUser },
      _id: { $nin: totalHideandBlockPostId },
      privacyType: { $nin: "onlyMe" },
      isActive: true,
      isDeleted: false
    }).populate("user_id", "username name avatar private follow").sort({ created_at: -1 }).exec();

  let get_like = await likeSchema.distinct("post_id", {
    user_id: user_id,
    isLike: 1,
  }).exec();
  let likedIds = get_like.map(String);
  //follow1
  all_feeds.forEach((data) => {
    stringFollowerId.forEach((followId) => {
      if (followId == data.user_id._id) {
        data.user_id.follow = 1;
      }
    })
  })
  //follow2
  all_feeds.forEach((data) => {
    requested.forEach((followId) => {
      if (followId == data.user_id._id) {
        data.user_id.follow = 2;
      }
    })
  })
  //isLiked
  all_feeds.forEach((post) => {
    likedIds.forEach((id) => {
      if (id == post._id) {
        post.isLiked = 1;
      }
    });
  });

  sleep(2000).then(function () {
    return res.json({
      success: true,
      feeds: all_feeds,
    });
  });

};

// sort by date
function sortFunction(a, b) {
  var dateA = new Date(a.date).getTime();
  var dateB = new Date(b.date).getTime();
  return dateA > dateB ? 1 : -1;
}

//updateviewPost
exports.updateviewpost = async (req, res, next) => {
  let { post_id, postUserId } = req.body;
  let user_id = req.user_id;
  //getViewdata
  const getViewdata = await viewPost
    .find({
      post_id: post_id,
      viewed_userId: user_id,
      post_userID: postUserId,
    })
    .exec();
  if (getViewdata.length > 0) {
    return res.json({
      success: false,
      message: "Already viewed",
    });
  } else {
    const data = new viewPost({
      post_id: post_id,
      viewed_userId: user_id,
      post_userID: postUserId,
    });
    const saveData = await data.save();
    if (saveData) {
      return res.json({
        success: true,
        message: "Post viewed successfully",
      });
    }
  }
};

//createReport
exports.createReport = async (req, res, next) => {
  const { post_id, report } = req.body;
  const user_id = req.user_id;
  const reports = new reportPost({
    post_id: post_id,
    reportedByid: user_id,
    report: report,
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
      msg: "Your report is not taken..try again!",
    });
  }
};

//getPostsbycategory
// exports.getPostsbycategory = async (req, res, next) => {
//   try 
//   {
//     let { post_id } = req.query;
//     let user_id = req.user_id;
//     const postData = await postSchema.findOne({ _id: post_id, isActive: true });
//     if (postData) {
//       const onlycategory = postData.category;
//       //getBlockedUsers
//       let getBlockedUsers = await blocked.distinct("Blocked_user",{Blocked_by: user_id }).exec();

//       const allcategory = await postSchema.find({
//         category: onlycategory,
//         user_id: {$nin: getBlockedUsers},
//         isActive: true,
//         isDeleted: false
//       }).exec();
//       if (allcategory.length > 0) 
//       { 
//         const following = await follow_unfollow.distinct("followingId", {
//           followerId: user_id,status: 1
//         }).exec();
//         const all_ID = following.map(String);
//         const totalId = [...new Set(all_ID)];
//         allcategory.forEach((data) => {
//           totalId.forEach((followerUserId) => {
//             if (followerUserId == data.user_id) {
//               data.follow = 1;
//             }
//           });
//         });
//         return res.json({
//           success: true,
//           result: allcategory,
//           message: "Posts fetched successfuly by category",
//         });
//       } else {
//         return res.json({
//           success: false,
//           msg: "No posts"
//         });
//       }
//     } else {
//       return res.json({
//         success: false,
//         msg: "No posts related to this category",
//       });
//     }
//   } catch (error) {
//     return res.json({
//       success: false,
//       msg: "error occured" + error,
//     });
//   }
// };

//getPostByhashtag

//hidePost
exports.hidePost = async (req, res, next) => {
  const { post_id } = req.body;
  const user_id = req.user_id;
  const hidepost = new hidePostSchema({
    post_id: post_id,
    hideByid: user_id,
    created_at: Date.now()
  });
  const saveData = await hidepost.save();
  if (saveData) {
    return res.json({
      success: true,
      message: "hide post successfully"
    });
  }
  else {
    return res.json({
      success: false,
      message: "error occured!" + error
    });
  }
}

//editPost
exports.editPost = async (req, res, next) => {

  let user_id = req.user_id;
  let { post_id, body, tagged_userId, privacyType, category } = req.body;

  let arr_hash;
  if (body) {
    arr_hash = body.match(/(^|\s)#(\w+)/g);
    console.log(arr_hash);
  }

  var hash_tag = [];

  if (arr_hash) {
    arr_hash = arr_hash.map(function (v) {
      return v.trim().substring(1);
    });

    hash_tag.push(...arr_hash);
    const get_hashtag = await hashtagSchema.distinct("hashtag", {
      hashtag: arr_hash,
    });

    console.log(get_hashtag);
    hash_tags = new Set(get_hashtag.map((tag) => tag));

    arr_hash = arr_hash.filter((id) => !hash_tags.has(id));

    console.log(arr_hash);

    arr_hash.forEach(async (element) => {
      const hashtag = new hashtagSchema({
        hashtag: element,
        created_at: new Date(),
      }).save();
    });
  }

  const postEdited = await postSchema.findOneAndUpdate(
    { _id: post_id },
    {
      $set:
      {
        body: body,
        hashtag: hash_tag,
        tagged_userId: tagged_userId,
        privacyType: privacyType,
        category: category
      }
    }, { new: true }).exec();

  if (postEdited) {
    if (tagged_userId.length) {
      const deleted = await userTagpost.deleteMany({ post_id: post_id });
      console.log(deleted)
      if (deleted) {
        tagged_userId.forEach(async (element) => {

          const saveTagged = new userTagpost({
            post_id: post_id,
            tagged_userId: element,
            taggedByuserId: user_id
          });
          await saveTagged.save();
        })
      }
    }
    sleep(1000).then(function () {
      return res.json({
        success: true,
        result: postEdited,
        message: "Post edited successfully"
      });
    });

  }
  else {
    return res.json({
      success: false,
      message: "error occured!" + error
    })
  }
}

// Edit privacy using Post ID

exports.edit_privacy = async (req, res, next) => {

  const post_id = req.body.post_id;
  const privacy_type = req.body.privacy_type;

  const update_post = await postSchema.findByIdAndUpdate(
    { _id: post_id },
    {
      $set: {
        privacyType: privacy_type,
      },
    },

    { new: true }
  )

  if (update_post) {
    res.json({
      success: true,
      result: update_post,
      message: "PrivacyType successfully  updated"
    })
  }
}

// Delete the post
exports.delete_post_New = async (req, res, next) => {
  const post_id = req.body.post_id;
  //updateDeleted
  const updateDeleted = await postSchema.updateOne(
    { _id: post_id },
    {
      $set: { isDeleted: true }
    },
    { new: true }
  ).exec();
  if (updateDeleted) {
    res.json({
      success: true,
      message: "Successfully deleted"
    })
  }
  else {
    res.json({
      success: false,
      message: "Not delete"
    })
  }
}



// Edit privacy using Post ID

exports.createShare = async (req, res, next) => {

  // let post_id = "60e67e22ec3af3328924691d";
  // let encryptdId = cryptr.encrypt(post_id);
  // console.log(encryptdId)
  // console.log("Decrypted email = ", cryptr.decrypt(encryptdId));


  let post_id = cryptr.decrypt(req.params.postId);
  console.log(post_id)
  const get_Post = await postSchema.findOne({ _id: post_id, isActive: true, isDeleted: false }).populate("user_id", "username avatar name private follow").exec();
  console.log(get_Post)

}


