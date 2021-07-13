const commentSchema = require("../../models/User/Comment");
const postSchema = require("../../models/User/Post");
const notificationSchema = require("../../models/User/Notification");
const Users = require("../../models/User/Users");
const { sendNotification } = require("../../helpers/notification");

// ************create comment*******************

exports.add_comment = async (req, res, next) => {
    //    get id and comment
    let user_id = req.body.user_id;
    var { comment, post_id } = req.body;

    // create document for user in db
    const updateComment = new commentSchema({
      post_id: post_id,
      user_id: user_id,
      comment: comment,
      created_at: new Date(),
    });
    const saveData = await updateComment.save();
    const updatecommentCount = await postSchema.updateOne(
      { _id: post_id },
      { $inc: { commentCount: 1 } },
      { new: true }
    );
    if (updatecommentCount) {
      const userPost = await postSchema.findOne({ _id: post_id });
      if (user_id != userPost.user_id) {
        const senderDetails1 = await commentSchema.find({post_id:post_id},{_id:0,user_id:1}).sort({created_at:-1})
        const arraysorting = [];
        senderDetails1.forEach((values)=>{
          arraysorting.push(values["user_id"])
          console.log(arraysorting)
        })
        const all_ID = arraysorting.map(String);
        const totalId = [...new Set(all_ID)];
        console.log(totalId)
        const updateNotification = new notificationSchema({
          sender_id: user_id,
          receiver_id: userPost.user_id,
          post_id: post_id,
          type: 1,
          seen: false
        });
        const saveNotificationData = await updateNotification.save();
        if (saveNotificationData) {
          sendNotification(totalId, userPost.user_id, 1);
          return res.json({
            success: true,
            message: "Comment added",
          });
        }
      }
    } else {
      return res.json({
        success: true,
        message: "Error Occured" + error
      });
    }
};

// get comment using post-id

exports.getPost_comments = async (req, res, next) => {
    const post_id = req.query.post_id;
    let inactiveUsers = await Users.distinct("_id", { isActive: false }).exec();
    console.log(inactiveUsers);
    const getcomment = await commentSchema.find({ post_id: post_id, user_id: { $nin: inactiveUsers } }).populate("user_id", "username name avatar private follow").exec();
    console.log(getcomment);
    if (getcomment.length > 0) {
      return res.json({
        success: true,
        comments: getcomment,
        message: "Comment fetched successfully"
      });
    } else {
      return res.json({
        success: true,
        comments: getcomment,
        message: "No comments"
      });
    }
};

// Delete comment using post_id

exports.delete_comment = async (req, res, next) => {
    let { comment_id } = req.body;
    // pull out comment
    const getComment = await commentSchema.findOne({ _id: comment_id });
    const comment = await commentSchema.findOneAndDelete({ _id: comment_id });
    const updatecommentCount = await postSchema.updateOne(
      { _id: getComment.post_id },
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    if (comment && updatecommentCount) {
      res.json({
        success: true,
        message: "Delete comment successfully",
      });
    } else {
      res.json({
        success: false,
        message: "Error occured in delete comment",
      });
    }
};

//addlikeTocomment
exports.addLiketoComment = async (req, res, next) => {
    const { user_id,comment_id } = req.body;

    if(req.body.type == 1)
    {
        const addlike = await commentSchema.findByIdAndUpdate(
                     {_id: comment_id },
                     {
                      $push: {
                          "LikedUser": {
                              _id: user_id,
                             }
                      }
                  }, { new: true }).exec();

        const increaseLikeCount = await commentSchema.updateOne(
        { _id: comment_id },
        { $inc: { likeCount: 1 } },
        { new: true });

        if (increaseLikeCount && addlike) {
          return res.json({
              success: true,
              message: 'successfully Liked the Comment'
          })
        }
        else {
          return res.json({
              success: false,
              message: 'error in like comment'
          })
        }
      
    } 
    else if(req.body.type == 0) 
    {
      const unlike = await commentSchema.findByIdAndUpdate(
        {_id : comment_id },
        {
          $pull: {
              "LikedUser": {
                  _id: user_id,
                 }
          }
      }, { new: true });

      const decreaseLikeCount = await commentSchema.updateOne(
        { _id: comment_id },
        { $inc: { likeCount: -1 } },
        { new: true }
      );

      if(unlike && decreaseLikeCount) {
        res.json({
          success : true,
          message : "Unlike successfully"
        })
      } else {
        res.json({
          success :false,
          message : "Error occured in unlike"
        })
      }
    }
}

