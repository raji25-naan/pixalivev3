const chatSchema = require("../../models/User/chat");
const reportChat = require("../../models/User/reportChat");
const Users = require("../../models/User/Users");
const userchatSchema = require("../../models/User/user_chat");
const block_chatSchema = require("../../models/User/chat_blocked");
const follow_unfollow = require("../../models/User/follow_unfollow");

// ************create comment*******************

exports.messages = async (req, res, next) => {
    try {
        const userid = req.user_id
        const find_user = await userchatSchema.find({ user_id: userid }).exec();
        if (find_user.length)
         {
            if (find_user[0].user_data.length) 
            { 
                find_user[0].user_data.reverse();
                if (find_user) 
                {
                    return res.json({
                        success: true,
                        result: find_user,
                        message: "user Data of Mge, Fetched successfully"
                    });
                }
            }
            else 
            {
                return res.json({
                    success: false,
                    message: "No message Data"
                });
            }
        }
        else 
        {
            return res.json({
                success: false,
                message: "No message Data"
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages data" + error,
        });
    }
};

exports.user_messages = async (req, res, next) => {

    try {
        const offset = req.query.offset;
        var row = 20;
        const currentUser = req.user_id;
        const gettingUser = req.query.user_id;
        const getMgeData = await chatSchema.find({ $or: [{ sender_id: currentUser, receiver_id: gettingUser, isDeletedbySender: false }, { sender_id: gettingUser, receiver_id: currentUser, isDeletedbyReceiver: false, isBlocked: false }] }).sort({ created_at: -1 }).exec();
        console.log(getMgeData)
        const send_message = getMgeData.splice(offset == undefined ? 0 : offset, row);
        if (getMgeData) {
            return res.json({
                success: true,
                result: send_message,
                message: "Mge Fetched successfully"
            });
        }
        else {
            return res.json({
                success: false,
                message: "Error getting message",
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }
};

exports.deleteSingleChat = async (req, res, next) => {

    try {
        let { id, createdAt, type } = req.body;
        const data = await chatSchema.findOne({ _id: id }).exec();
        let senderId = data.sender_id;
        let receiverId = data.receiver_id;
        const currentUser_id = req.user_id;

        if (type == 1) {
            //checkAfterMessage 
            const checkAfterMessage = await chatSchema.find({ sender_id: senderId, receiver_id: receiverId, created_at: { $gt: createdAt } }).exec();
            if (checkAfterMessage.length) {
                const updateSenderDelete = await chatSchema.updateOne(
                    { _id: id },
                    {
                        $set: { isDeletedbySender: true }
                    }, { new: true }
                );
                if (updateSenderDelete) {
                    return res.json({
                        success: false,
                        message: "Successfully Deleted"
                    });
                }
            }
            else {
                //checkBeforeMessage
                const checkBeforeMessage = await chatSchema.find({ sender_id: senderId, receiver_id: receiverId, created_at: { $lt: createdAt } }).sort({ created_at: -1 }).exec();
                const pull_data = await userchatSchema.updateOne(
                    { user_id: currentUser_id },
                    {
                        $pull: {
                            "user_data": {
                                user_id: senderId,
                                receiver_id: receiverId,
                            }
                        }
                    }, { new: true }
                ).exec();
                if (checkBeforeMessage.length) {

                    let data_message = checkBeforeMessage[0];
                    if (currentUser_id == data_message.sender_id) {
                        const push_data1 = await userchatSchema.updateOne(
                            { user_id: currentUser_id },
                            {
                                $push: {
                                    "user_data": {
                                        user_id: data_message.sender_id,
                                        receiver_id: data_message.receiver_id,
                                        user_message: data_message.message,
                                        created_at: Date.now(),
                                    }
                                }
                            }, { new: true }
                        ).exec();
                    }
                    else {
                        const push_data2 = await userchatSchema.updateOne(
                            { user_id: currentUser_id },
                            {
                                $push: {
                                    "user_data": {
                                        user_id: data_message.sender_id,
                                        receiver_id: data_message.receiver_id,
                                        receiver_message: data_message.message,
                                        created_at: Date.now(),
                                    }
                                }
                            }, { new: true }
                        ).exec();
                    }


                }


                if (pull_data) {
                    const updateSenderDelete = await chatSchema.updateOne(
                        { _id: id },
                        {
                            $set: { isDeletedbySender: true }
                        }, { new: true }
                    );
                    if (updateSenderDelete) {
                        return res.json({
                            success: false,
                            message: "Successfully Deleted"
                        });
                    }
                }

            }
        }
        else if (type == 2) {
            //checkAfterMessage 
            const checkAfterMessage = await chatSchema.find({ sender_id: receiverId, receiver_id: senderId, created_at: { $gt: createdAt } }).exec();
            if (checkAfterMessage.length) {
                const updateReceiverDelete = await chatSchema.updateOne(
                    { _id: id },
                    {
                        $set: { isDeletedbyReceiver: true }
                    }, { new: true }
                );
                if (updateReceiverDelete) {
                    return res.json({
                        success: false,
                        message: "Successfully Deleted"
                    });
                }
            }
            else {
                //checkBeforeMessage
                const checkBeforeMessage_2 = await chatSchema.find({ sender_id: receiverId, receiver_id: senderId, created_at: { $lt: createdAt } }).sort({ created_at: -1 }).exec();
                const pull_data_2 = await userchatSchema.updateOne(
                    { user_id: currentUser_id },
                    {
                        $pull: {
                            "user_data": {
                                user_id: senderId,
                                receiver_id: receiverId,
                            }
                        }
                    }, { new: true }
                ).exec();
                if (checkBeforeMessage_2.length) {

                    let data_message_2 = checkBeforeMessage_2[0];
                    if (currentUser_id == data_message_2.sender_id) {
                        const push_data_type2 = await userchatSchema.updateOne(
                            { user_id: currentUser_id },
                            {
                                $push: {
                                    "user_data": {
                                        user_id: data_message_2.sender_id,
                                        receiver_id: data_message_2.receiver_id,
                                        user_message: data_message_2.message,
                                        created_at: Date.now(),
                                    }
                                }
                            }, { new: true }
                        ).exec();
                    }
                    else {
                        const push_data_type = await userchatSchema.updateOne(
                            { user_id: currentUser_id },
                            {
                                $push: {
                                    "user_data": {
                                        user_id: data_message_2.sender_id,
                                        receiver_id: data_message_2.receiver_id,
                                        receiver_message: data_message_2.message,
                                        created_at: Date.now(),
                                    }
                                }
                            }, { new: true }
                        ).exec();
                    }


                }
                if (pull_data_2) {
                    const updateReceiverDelete = await chatSchema.updateOne(
                        { _id: id },
                        {
                            $set: { isDeletedbyReceiver: true }
                        }, { new: true }
                    );
                    if (updateReceiverDelete) {
                        return res.json({
                            success: false,
                            message: "Successfully Deleted"
                        });
                    }
                }
            }
        }
    }

    catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }

}

//reportIndividualUser
exports.reportIndividualUser = async (req, res, next) => {

    try {
        let user_id = req.user_id;
        let { id, report } = req.body;
        //checkAlreadyReported
        const checkAlreadyReported = await reportChat.findOne({ reportedByid: user_id, reported_id: id });
        if (checkAlreadyReported) {
            return res.json({
                success: false,
                message: "Already reported by you!"
            });
        }
        else {
            const data = new reportChat({
                report: report,
                reportedByid: user_id,
                reported_id: id
            });
            const saveData = await data.save();
            if (saveData) {
                return res.json({
                    success: true,
                    message: "Successfully report"
                });
            }
        }
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }
}

//deleteAllChat
exports.deleteAllChat = async (req, res, next) => {

    try {
        let { senderId, receiverId } = req.body;
        //updateSenderDelete
        const updateSenderDelete = await chatSchema.updateMany(
            { sender_id: senderId, receiver_id: receiverId },
            {
                $set: { isDeletedbySender: true }
            }, { new: true }
        ).exec();
        //updateReceiverDelete
        const updateReceiverDelete = await chatSchema.updateMany(
            { sender_id: receiverId, receiver_id: senderId },
            {
                $set: { isDeletedbyReceiver: true }
            }, { new: true }
        ).exec();
        if (updateSenderDelete && updateReceiverDelete) {
            const pullMessage = await userchatSchema.updateOne(
                { user_id: senderId },
                {
                    $pull: {
                        "user_data": {
                            user_id: senderId,
                            receiver_id: receiverId
                        }
                    }
                }, { new: true }
            ).exec();
            if (pullMessage) {
                return res.json({
                    success: true,
                    message: "Successfully Deleted"
                });
            }
        }
    }
    catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }
}

// block user
exports.block_chatuser = async (req, res, next) => {
    try {
        const current_userId = req.user_id;
        const toBlock_userID = req.body.user_Id;

        var find_currentuser = await block_chatSchema.find({ user_id: current_userId });
        if (find_currentuser.length) {
            console.log("hi")

            const add_blockedUser = await block_chatSchema.updateOne(
                { user_id: current_userId },
                {
                    $push: {
                        "BlockedByuser_IDs": {
                            user_id: toBlock_userID,
                            created_at: Date.now(),
                        }
                    }
                }, { new: true }
            ).exec();
        }
        else {
            var create_blockedUser = new block_chatSchema({
                user_id: current_userId,
                BlockedByuser_IDs: [
                    {
                        user_id: toBlock_userID,
                        created_at: Date.now(),
                    },
                ]
            })
            const saveData = await create_blockedUser.save();
        }
        var find_blockeduser = await block_chatSchema.find({ user_id: toBlock_userID });
        if (find_blockeduser.length) {
            console.log("hi")

            const add_receivedUser = await block_chatSchema.updateOne(
                { user_id: current_userId },
                {
                    $push: {
                        "BlockedTheUser_IDs": {
                            user_id: toBlock_userID,
                            created_at: Date.now(),
                        }
                    }
                }, { new: true }
            ).exec();
        }
        else {
            var create_receivedUser = new block_chatSchema({
                user_id: current_userId,
                BlockedTheUser_IDs: [
                    {
                        user_id: toBlock_userID,
                        created_at: Date.now(),
                    },
                ]
            })
            const saveData1 = await create_receivedUser.save();
        }

        return res.json({
            success: true,
            message: "Blocked Successfully",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }

}

// Unblock user
exports.unblock_chatuser = async (req, res, next) => {
    try {
        const current_userId = req.user_id;
        const UnBlock_userID = req.body.user_Id;

        const unBlock_user = await block_chatSchema.updateOne(
            { user_id: current_userId },
            {
                $pull: {
                    "BlockedByuser_IDs": {
                        user_id: UnBlock_userID
                    }
                }
            }, { new: true }
        ).exec();

        const unBlockIn_user = await block_chatSchema.updateOne(
            { user_id: UnBlock_userID },
            {
                $pull: {
                    "BlockedTheUser_IDs": {
                        user_id: current_userId
                    }
                }
            }, { new: true }
        ).exec();
        if (unBlock_user && unBlockIn_user) {
            return res.json({
                success: true,
                message: "UnBlocked Successfully",
            });
        }
    } catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error,
        });
    }
}

exports.find_block = async (req, res, next) => {
    try {
        const current_userId = req.user_id;
        const UnBlock_userID = req.query.user_Id;

        const find_block = await block_chatSchema.distinct("BlockedByuser_IDs.user_id", { user_id: current_userId });
        if (find_block.length) {
            var change_string = find_block.toString();
            if (change_string.includes(UnBlock_userID.toString())) {
                return res.json({
                    success: true
                });
            }
            else {
                return res.json({
                    success: false
                });
            }
        }
        else {
            return res.json({
                success: false
            });
        }

    } catch (error) {
        return res.json({
            success: false,
            message: "Error getting Messages" + error
        });
    }
}

exports.suggestionChat = async(req,res,next)=>{

    try 
    {
        let user_id = req.user_id;
        //getFollowingId
        let getFollowingId = await follow_unfollow.distinct("followingId",{followerId: user_id,status: 1}).exec();
        let friendsIds = getFollowingId.map(String);
        //getReceiverId
        let getReceiverId = await chatSchema.distinct("receiver_id",{sender_id: user_id}).exec();
        //getSenderId
        let getSenderId = await chatSchema.distinct("sender_id",{receiver_id: user_id}).exec();
        //totalChatId
        let totalChatId = getReceiverId.concat(getSenderId).map(String);
        let all_ID = [...new Set(totalChatId)];
        var totalId = friendsIds.filter(item => !all_ID.includes(item));
        //suggestedUserData
        const suggestedUserData = await Users.find({_id: totalId,isActive: true}).exec();
        if(suggestedUserData.length > 0)
        {
            return res.json({
                success: true,
                result: suggestedUserData,
                message: "Successfully fetched suggestion lists!"
              });
        }
        else
        {
            return res.json({
                success: true,
                result: suggestedUserData,
                message: "No suggestion lists!"
              });
        }
        

    } 
    catch (error) 
    {
        return res.json({
            success: false,
            message: "Error getting suggestion chat" + error
        }); 
    }
}
