const Like = require('../../models/User/like');
const Post = require('../../models/User/Post');
const notificationSchema = require('../../models/User/Notification');
const TagPost = require('../../models/User/userTagpost');
const { sendNotification } = require('../../helpers/notification');

exports.add_like = async (req, res, next) => {

      let user_id = req.user_id;
      console.log("AB",user_id)
      let {post_id } = req.body; 
      if(req.body.type == 1)
      {
        //Update like
        const updateLike = new Like({
        post_id: post_id,
        user_id: user_id,
        isLike : 1,
        created_at: Date.now(),
        });
        const saveData = await updateLike.save();
        if(saveData){
            //update likeCount
            const updateLikeCount = await Post.updateOne(
                    {_id : post_id},
                    {$inc : {likeCount :1}},
                    {new :true}
            );
            if(updateLikeCount)
            {
              const LikePost = await Post.findOne({ _id: post_id });
              if (user_id != LikePost.user_id) 
                {
                const senderDetails1 = await Like.find({post_id:post_id},{_id:0,user_id:1}).sort({created_at:-1})
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
                  receiver_id: LikePost.user_id,
                  post_id: post_id,
                  type:0,
                  seen: false,
                  created_at:Date.now()
                });
                
                const saveNotificationData = await updateNotification.save();
                if (saveNotificationData) {
                  sendNotification(totalId, LikePost.user_id,0);
                    return res.json({
                    success: true,
                    message:"Like added and notification Sent"
                });
              }
              }
            }
            else
            {
                return res.json({
                    success:false,
                    message:"Error In liking Post"
                })
            }
        }
      else
      {
        return res.json({
          success:false,
          message:"Error In liking Post"
        })
      } 
      }
      else if(req.body.type == 0)
      {
        //deleteLike
        const deleteLike = await Like.findOneAndDelete({
          post_id: post_id,
          user_id: user_id,
        });
        if(deleteLike)
        {
          //update likeCount
          const updateLikeCount = await Post.updateOne(
            {_id : post_id},
            {$inc : {likeCount : -1}},
            {new :true}
        );
        if(updateLikeCount)
        {
            return res.json({
                success: true,
                message:"unlike successfully"
            })
        }
        }

      }  
  }

exports.liked_post = async (req,res,next) => {

          let {userId} = req.user_id;
     
          const likedPostId = await Like.distinct("post_id",{user_id:userId}).exec();
          //getPosts
          const getPosts = await Post.find({_id:likedPostId,isActive:true}).exec();
            if(getPosts){
              return res.json({
                success:true,
                results:getPosts,
                message:"Liked posts fetched successfully"
              })
            }
            else{
              return res.json({
                success:false,
                message:"No data found"
              })
            }
  }
