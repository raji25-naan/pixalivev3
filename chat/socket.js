
const jwt = require('jsonwebtoken');
const messageSchema = require('../api/models/User/chat');
const user_chatSchema = require('../api/models/User/user_chat');
const blocked_chatSchema = require('../api/models/User/chat_blocked');

const notificationSchema = require("../api/models/User/Notification");
const { sendNotification } = require("../api/helpers/notification");

var socket_io = require('socket.io');
var io = socket_io();
var socketApi = {};

socketApi.io = io;
console.log(io)
io.on('connection', socket => {
  //Get the chatID of the user and join in a room of the same chatID
  var channel = socket.handshake.query.channel;
  var token = socket.handshake.query.token;
  var userID;
  if (token != "null") {
    try {
      console.log("enter")
      const decodedId = jwt.verify(token, process.env.JWT_KEY);
      userID = decodedId.user.id;
    } catch (error) {
      console.log(error)
    }
  }

  //Leave the room if the user closes the socket
  socket.on('disconnect', () => {
    socket.leave(channel);
  });

  //Send message to only a particular user
  socket.on('send_message', async data => {
    //var message = JSON.parse(data);

    receiverId = data.receiver_id;
    senderId = data.sender_id;
    message = data.message;
    url = data.url;
    post_type = data.post_type;
    thumbnail = data.thumbnail;
    //console.log('Got message ' + message + ' from ' + senderId + ' to ' + channel);


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
          const updateSchema = chatUpdateBlock(senderId, receiverId, message, url, post_type, thumbnail);
          const update_userChatBlocked = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
        }
        else {
          if (userID.toString() == senderId.toString()) {
            notification(senderId, receiverId)
            const updateSchemaChat3 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail);
            const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
            const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
          }
          if (userID.toString() == receiverId.toString()) {
            notification(senderId, receiverId)
            const updateSchemaChat2 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail);
            const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
            const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

          }
        }

      }
      else {
        const updateSchemaChat1 = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail);
        if (userID.toString() == senderId.toString()) {
          notification(senderId, receiverId)
          const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
          const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
        }
        if (userID.toString() == receiverId.toString()) {
          notification(senderId, receiverId)
          const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
          const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

        }
      }
    }
    else {
      const updateSchemaChat = chatUpdate(senderId, receiverId, message, url, post_type, thumbnail);
      if (userID.toString() == senderId.toString()) {
        notification(senderId, receiverId)
        const update_userChatOne = updateUserChat(0, senderId, receiverId, message, url, post_type, thumbnail);
        const update_receiveOne = updateUserChat(1, receiverId, senderId, message, url, post_type, thumbnail)
      }
      if (userID.toString() == receiverId.toString()) {
        notification(senderId, receiverId)
        const update_userChatTwo = updateUserChat(1, senderId, receiverId, message, url, post_type, thumbnail);
        const update_receiveTwo = updateUserChat(0, receiverId, senderId, message, url, post_type, thumbnail)

      }
    }


    // if (create_mge) {

    //   //Send message to only that particular room
    //   socket.to(receiverId + '-' + senderId).emit('receive_message', {
    //     message: message,
    //     sender_id: senderId,
    //     receiver_id: receiverId,
    //   });
    // }
  });
  socket.on('start_typing', data => {
    io.to(data).emit('start_typing', {
      typing: true,
    });
  });
  socket.on('stop_typing', data => {
    io.to(data).emit('stop_typing', {
      typing: false,
    });
  });
});

socketApi.sendNotification = function () {
  io.sockets.emit('hello', { msg: 'Hello World!' });
}

async function chatUpdateBlock(senderId, receiverId, message, url, post_type, thumbnail) {
  var create_mge = await new messageSchema({
    sender_id: senderId,
    receiver_id: receiverId,
    message: message,
    url: url,
    thumbnail: thumbnail,
    post_type: post_type,
    isBlocked: true,
    created_at: Date.now(),
  }).save();
}

async function chatUpdate(senderId, receiverId, message, url, post_type, thumbnail) {
  // Insert message into database

  var create_mge = await new messageSchema({
    sender_id: senderId,
    receiver_id: receiverId,
    message: message,
    url: url,
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

async function notification(senderid, receiverid) {
  const updateNotification_private = new notificationSchema({
    sender_id: senderid,
    receiver_id: receiverid,
    type: 5,
    seen: false,
    created_at: Date.now(),
  });
  const saveNotificationData_private = await updateNotification_private.save()
  if (saveNotificationData_private) {
    sendNotification(senderid, receiverid, 5);
    return res.json({
      success: true,
      message: 'successfully following and notification Sent'
    });
  }
}


module.exports = socketApi;