
const follow_unfollow = require("../../models/User/follow_unfollow");
const Users = require("../../models/User/Users");
const viewPost = require("../../models/User/viewPost");
const notificationSchema = require("../../models/User/Notification");
const { sendNotification } = require("../../helpers/notification");
const blocked = require("../../models/User/blocked");
const sleep = require('sleep-promise');

//createFollowNew
exports.createFollowNew = async (req, res, next) => {

    const followerId = req.user_id;
    const followingId = req.body.following_id;
    const checkFollow = await follow_unfollow.findOne({
      followerId: followerId,
      followingId: followingId
    }).exec();

    if (req.body.type == 1) 
    {
      if (checkFollow !== null) {
        console.log("Already follow")
        return res.json({
          success: false,
          message: "Already existing... Check !!!"
        })
      }
      else {
        const check_Private = await Users.findOne({ _id: followingId }).exec();
        if (check_Private.private == true) {
          const dataStatus = new follow_unfollow({
            followerId: followerId,
            followingId: followingId,
            status: 0,
            created_at: Date.now()
          });
          const saveData_status = await dataStatus.save();
          if (saveData_status) {
            const followerDetails = await follow_unfollow.find({followingId:followingId, status: 0},{_id:0,followerId:1}).sort({created_at:-1})
            const arraysorting1 = [];
            followerDetails.forEach((values)=>{
              arraysorting1.push(values["followerId"])
              console.log(arraysorting1)
            })
            const all_ID = arraysorting1.map(String); 
                  const totalId = [...new Set(all_ID)];
                  console.log(totalId)
            const updateNotification_private = new notificationSchema({
              sender_id: followerId,
              receiver_id: followingId,
              type: 3,
              seen: false,
              created_at: Date.now(),
            });
            const saveNotificationData_private = await updateNotification_private.save()
            if (saveNotificationData_private) {
              sendNotification(totalId, followingId, 3);
              return res.json({
                success: true,
                message: 'successfully following and notification Sent'
              });
            }
          }
        }
        else {
          // public
          const data = new follow_unfollow({
            followerId: followerId,
            followingId: followingId,
            status: 1,
            created_at: Date.now()
          });
          const saveData = await data.save();
          if (saveData) {
            //increase followingCount
            const updateFollowingCount = await Users.updateOne(
              { _id: followerId },
              { $inc: { followingCount: 1 } },
              { new: true }
            );
            //increase followerCount
            const updateFollowerCount = await Users.updateOne(
              { _id: followingId },
              { $inc: { followersCount: 1 } },
              { new: true }
            );
            if (updateFollowingCount && updateFollowerCount) 
            {
              const UserDetails = await follow_unfollow.find({followingId:followingId, status: 1},{_id:0,followerId:1}).sort({created_at:-1})
              const arraysorting2 = [];
              UserDetails.forEach((values)=>{
                arraysorting2.push(values["followerId"])
                console.log(arraysorting2)
              })
              const all_ID = arraysorting2.map(String); 
                    const totalIds = [...new Set(all_ID)];
                    console.log(totalIds)
              const updateNotification = new notificationSchema({
                sender_id: followerId,
                receiver_id: followingId,
                type: 2,
                seen: false,
                created_at: Date.now(),
              });
              const saveNotificationData = await updateNotification.save()
              if (saveNotificationData) {
                sendNotification(totalIds, followingId, 2);
                return res.json({
                  success: true,
                  message: 'successfully following and notification Sent'
                });
              }
            }
          }

        }
      }
    }
    else if (req.body.type == 0) 
    {
      if (checkFollow !== null) 
      {
        if (checkFollow.status == 1)
        {
          const unfollow = await follow_unfollow.findOneAndDelete(
            {
              followerId: followerId,
              followingId: followingId
            });
          if (unfollow) 
          {
            //decrease followingCount
            const updateFollowingCount = await Users.updateOne(
              { _id: followerId },
              { $inc: { followingCount: -1 } },
              { new: true }
            );
            //decrease followerCount
            const updateFollowerCount = await Users.updateOne(
              { _id: followingId },
              { $inc: { followersCount: -1 } },
              { new: true }
            );
            //checkType2
            const checkType2 = await notificationSchema.findOne({
              sender_id: followerId,
              receiver_id: followingId,
              type: 2
            });
            if(checkType2)
            {
              //Remove_Notification
              const Remove_Notification1 = await notificationSchema.findOneAndDelete({
                sender_id: followerId,
                receiver_id: followingId,
                type: 2
              }).exec();
            }
            //checkType4
            const checkType4 = await notificationSchema.findOne({
              sender_id: followerId,
              receiver_id: followingId,
              type: 4
            });
            if(checkType4)
            {
              const Remove_Notification2 = await notificationSchema.findOneAndDelete({
                sender_id: followerId,
                receiver_id: followingId,
                type: 4
              }).exec();
            }
            if(updateFollowingCount && updateFollowerCount)
            {
              return res.json({
                success: true,
                message: "successfully unfollowed"
              })
            }
          }
        }
        else if (checkFollow.status == 0) 
        {
          const Remove_unfollow = await follow_unfollow.findOneAndDelete(
            {
              followerId: followerId,
              followingId: followingId
            });
          //Remove_Notification
          const Remove_Notification = await notificationSchema.findOneAndDelete({
            sender_id: followerId,
            receiver_id: followingId,
            type: 3
          }).exec();
          if (Remove_unfollow) {
            return res.json({
              success: true,
              message: "Removed successfully"
            })
          }
        }

      }
      else {
        console.log("existing")
        return res.json({
          success: false,
          message: "Not an existing Follower... Check !!!"
        })
      }
    }
    else {
      return res.json({
        success: false,
        message: "Type is not Defined",
      })
    }
}

//update_follow
exports.update_follow = async (req, res, next) => {

    const followerId = req.body.follower_Id;
    const followingId = req.user_id;
    if (req.body.type == 1) 
    {
      const checkFollow = await follow_unfollow.findOne({
        followerId: followerId,
        followingId: followingId,
        status: 1
      }).exec();
      //checkFollow
      if (checkFollow !== null) 
      {
        console.log("Already follow")
        return res.json({
          success: false,
          message: "Already existing... Check !!!"
        })
      }
      else
      {
        const update_model = await follow_unfollow.findOneAndUpdate(
          {
            followerId: followerId,
            followingId: followingId
          },
          {
            $set: {
              status: 1
            },
          },
          { new: true }
        );

        if (update_model) 
        {
          //increase followingCount
          const updateFollowingCount = await Users.updateOne(
            { _id: followerId },
            { $inc: { followingCount: 1 } },
            { new: true }
          );
          //increase followerCount
          const updateFollowerCount = await Users.updateOne(
            { _id: followingId },
            { $inc: { followersCount: 1 } },
            { new: true }
          );
          if (updateFollowingCount && updateFollowerCount) 
          {
            const followerDetails = await follow_unfollow.find({followerId:followerId, status: 1},{_id:0,followingId:1}).sort({created_at:-1})
            const arraysorting1 = [];
            followerDetails.forEach((values)=>{
              arraysorting1.push(values["followingId"])
              console.log(arraysorting1)
            })
            const all_ID = arraysorting1.map(String); 
                  const totalId = [...new Set(all_ID)];
            //updateNotification
            const updateNotification = new notificationSchema({
              sender_id: followingId,
              receiver_id: followerId,
              type: 4,
              seen: false,
              created_at: Date.now(),
            });
            const saveNotificationData = await updateNotification.save();
            //Remove_Notification
            const Remove_Notification = await notificationSchema.findOneAndDelete({
              sender_id: followerId,
              receiver_id: followingId,
              type: 3
            }).exec();
            if (saveNotificationData && Remove_Notification) 
            {
              sendNotification(totalId, followerId, 4);
              return res.json({
                success: true,
                message: 'successfully following and notification Sent'
              });
            }
          }
        }
        else
        {
          return res.json({
            success: false,
            message: "Error Occured!!!" + error,
          })
        }
      }
    }
    else if(req.body.type == 2) 
    {
      const Remove_Follow = await follow_unfollow.findOneAndDelete({
        followerId: followerId,
        followingId: followingId,
        status: 0
      }).exec();
      const Remove_Notification = await notificationSchema.findOneAndDelete({
        sender_id: followerId,
        receiver_id: followingId,
        type: 3
      }).exec();
      if (Remove_Follow && Remove_Notification) {
        return res.json({
          success: true,
          message: 'Removed following successfully'
        });
      }
    }
}

//mutualFriendList
exports.mutualFriendList = async (req, res, next) => {

    let user_id = req.user_id;
    let id = req.query.id

    //getFollowingIdByUserid
    let getFollowingIdByUserid = await follow_unfollow.distinct('followingId', { followerId: user_id });
    //getFollowerIdByUserid
    let getFollowerIdByUserid = await follow_unfollow.distinct('followerId', { followingId: user_id });
    let a = getFollowingIdByUserid.concat(getFollowerIdByUserid);
    let totalIdByUserid = a.map(String);
    //getFollowingIdByid
    let getFollowingIdByid = await follow_unfollow.distinct('followingId', { followerId: id });
    // getFollowerIdByid
    let getFollowerIdByid = await follow_unfollow.distinct('followerId', { followingId: id });
    let b = getFollowingIdByid.concat(getFollowerIdByid);
    let totalIdByid = b.map(String);
    //filterData
    const totalUserIdArray = totalIdByUserid.filter(Set.prototype.has, new Set(totalIdByid));
    //getMutualFriendsData
    const getMutualFriendsData = await Users.find({ _id: { $in: totalUserIdArray }, isActive: true }).exec();
    if (getMutualFriendsData) {
      return res.json({
        success: true,
        result: getMutualFriendsData,
        message: "Mutual friends fetched successfully"
      })
    }
    else {
      return res.json({
        success: false,
        message: "Error Occured!!!" + error,
      })
    }
}

exports.get_following = async (req, res, next) => {

    const followerId = req.query.id;
    const uid = req.user_id;

    const getFollowingid = await follow_unfollow.distinct("followingId", {
      followerId: followerId, status: 1
    }).exec();

    const getFollowingUserData = await Users.find({
      _id: { $in: getFollowingid }, isActive: true
    }).exec();
    //data_follower
    const data_follower = await follow_unfollow.distinct("followingId", {
      followerId: uid, status: 1
    }).exec();
    const all_ID = data_follower.map(String);
    const totalId = [...new Set(all_ID)];
    //data_request
    const data_request = await follow_unfollow.distinct("followingId", {
      followerId: uid, status: 0
    }).exec();
    const request_ID = data_request.map(String);
    const requestedId = [...new Set(request_ID)];
    //follow1
    getFollowingUserData.forEach((data) => {
      totalId.forEach((followingUserId) => {
        if (followingUserId == data._id) {
          data.follow = 1;
        }
      });
    });
    //follow2
    getFollowingUserData.forEach((data) => {
      requestedId.forEach((reqId) => {
        if (reqId == data._id) {
          data.follow = 2;
        }
      });
    });
    sleep(2000).then(function () {
      return res.json({
        success: true,
        result: getFollowingUserData,
        message: "Successfully fetched following users!"
      });
    })
}

exports.get_followers = async (req, res, next) => {

    const followingId = req.query.id;
    const uid = req.user_id;

    const getFollowerid = await follow_unfollow.distinct("followerId", {
      followingId: followingId, status: 1
    });
    const getFollowerUserData = await Users.find({
      _id: { $in: getFollowerid }, isActive: true
    });
    //data_follower
    const data_follower = await follow_unfollow.distinct("followingId", {
      followerId: uid, status: 1
    });    
    const all_ID = data_follower.map(String);
    const totalId = [...new Set(all_ID)];
    //data_request
    const data_request = await follow_unfollow.distinct("followingId", {
      followerId: uid, status: 0
    });    
    const request_ID = data_request.map(String);
    const requestedId = [...new Set(request_ID)];
    //follow1
    getFollowerUserData.forEach((data) => {
      totalId.forEach((followerUserId) => {
        if (followerUserId == data._id) {
          data.follow = 1;
        }
      });
    });
    //follow2
    getFollowerUserData.forEach((data) => {
      requestedId.forEach((reqId) => {
        if (reqId == data._id) {
          data.follow = 2;
        }
      });
    });
    sleep(2000).then(function () {
      let sortedFollowerUserData = getFollowerUserData.sort((a,b) => ((a.follow)-(b.follow)));
      return res.json({
        success: true,
        result: sortedFollowerUserData,
        message: "Successfully fetched followers!"
      });
    })
    
};

exports.suggestionFriendList = async (req, res, next) => {

    let userId = req.user_id;
    console.log(req.query);
    const getFollowerId = await follow_unfollow.distinct("followerId", { followingId: userId }).exec();
    const getFollowingId = await follow_unfollow.distinct("followingId", { followerId: userId }).exec();
    let all_ID = getFollowerId.concat(getFollowingId).map(String);
    let totalId = [...new Set(all_ID)];
    //getFriendsId
    const getfriendFollowerId = await follow_unfollow.distinct("followerId", { followingId: totalId }).exec();
    const getfriendFollowingId = await follow_unfollow.distinct("followingId", { followerId: totalId }).exec();
    let friends_ID = getfriendFollowerId.concat(getfriendFollowingId).map(String);
    let totalFriendsId = [...new Set(friends_ID)];
    //filterId
    let ids = new Set(totalId.map((id) => id));
    const filteredFriendoffriends = totalFriendsId.filter((id) => !ids.has(id));

    let totalSuggestedIds = arrayRemove(filteredFriendoffriends, userId);
    console.log(totalSuggestedIds);
    //getSuggestedList
    const getSuggestedList = await Users.find(
      { _id: totalSuggestedIds, isActive: true },
      { _id: 1, username: 1, name: 1, email: 1, avatar: 1, phone: 1, private: 1, followersCount: 1, followingCount: 1 }
    ).exec();
    return res.json({
      success: true,
      result: getSuggestedList
    })
}

//DiscoverPeople
exports.DiscoverPeople = async (req, res, next) => {

    const userId = req.user_id;
    const Organization = [];
    var Education = [];
    let getBlockedUsers = await blocked.distinct("Blocked_user",{Blocked_by: userId }).exec();
    console.log(getBlockedUsers)
    const UserDetails = await Users.findOne({ _id: userId })
    UserDetails.WorkExperience.forEach(async(data)=>{
      Organization.push(data.OrganizationName)
      })
    const WorkingDetails = await Users.distinct("_id",{WorkExperience:{$elemMatch:{OrganizationName:Organization}}})
    const totalIds = [...new Set(WorkingDetails)];
    console.log(totalIds)
    UserDetails.Qualification.forEach(async(datas)=>{
      Education.push(datas.InstituteName)
    })
      const QualifyDetails = await Users.distinct("_id", {Qualification:{$elemMatch:{InstituteName:Education}}})
      const all_data = [...new Set(QualifyDetails)];
      console.log(all_data)
    const LocationDetails = await Users.distinct("_id", { Location: UserDetails.Location }).exec();
    const getFollowerId = await follow_unfollow.distinct("followerId", { followingId: userId, status: 1 }).exec();
    const getFollowingId = await follow_unfollow.distinct("followingId", { followerId: userId, status: 1 }).exec();
    let all_ID = getFollowerId.concat(getFollowingId).map(String);
    let totalId = [...new Set(all_ID)];
    const getfriendFollowerId = await follow_unfollow.distinct("followerId", { followingId: totalId, status: 1 }).exec();
    const getfriendFollowingId = await follow_unfollow.distinct("followingId", { followerId: totalId, status: 1 }).exec();
    let friends_ID = getfriendFollowerId.concat(getfriendFollowingId).map(String);
    let totalFriendsId = [...new Set(friends_ID)];
    let ids = new Set(totalId.map((id) => id));
    const filteredFriendoffriends = totalFriendsId.filter((id) => !ids.has(id));
    console.log(filteredFriendoffriends)
    const Total = totalIds.concat(all_data, LocationDetails, filteredFriendoffriends).map(String);
    const TotalDiscovering = [...new Set(Total)];
    const TotallyDiscovered = arrayRemove(TotalDiscovering, userId)
    const DiscoveredPeople = await Users.find({ _id: { $in: TotallyDiscovered, $nin: getBlockedUsers }, isActive: true }).exec();
    if(DiscoveredPeople.length > 0)
     {
      let followingIds = getFollowingId.map(String);
      let followingList = [...new Set(followingIds)];
      //getRequestedId
      const getRequestedId = await follow_unfollow.distinct("followingId", { followerId: userId, status: 0 }).exec();
      let requestedIds = getRequestedId.map(String);
      let requestedList = [...new Set(requestedIds)];
      //follow1
      DiscoveredPeople.forEach((data) => {
        followingList.forEach((followingUserId) => {
          if (followingUserId == data._id) {
            data.follow = 1;
          }
        });
      });
      //follow2
      DiscoveredPeople.forEach((data) => {
        requestedList.forEach((requestUserId) => {
          if (requestUserId == data._id) {
            data.follow = 2;
          }
        });
      });
      sleep(2000).then(function () {
        return res.json({
          success: true,
          DiscoverPeople: DiscoveredPeople,
          message: "DiscoveredPeople fetched successfully"
        })
      })
      
    } else {
      return res.json({
        success: false,
        Msg: "Not found"
      })
    }
}

//arrayRemove
function arrayRemove(arr, id) {
  return arr.filter(function (user_id) {
    return user_id != id;
  });
}