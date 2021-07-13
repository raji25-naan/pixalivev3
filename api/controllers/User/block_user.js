const blockschema = require("../../models/User/blocked");
const Users = require("../../models/User/Users");


// block and unblock user

exports.block_unblock_people = async (req, res, next) => {
        const Blocked_user = req.body.user_id;
        const current_user = req.user_id;

        if (req.body.type == 0) {
            const block = new blockschema({
                Blocked_user: Blocked_user,
                Blocked_by: current_user,
                created_at: new Date(),
            });
            const blocked = await block.save();
            if (blocked) {

                return res.json({
                    success: true,
                    message: "User is blocked successfully"
                })
            }
            else {
                return res.json({
                    success: false,
                    message: "Failed to update blocked user"
                })
            }

        }
        else if (req.body.type == 1) {
            const unblock_user = await blockschema.findOneAndDelete({
                Blocked_user: Blocked_user,
                Blocked_by: current_user
            })

            if (unblock_user) {
                return res.json({
                    success: true,
                    message: "unblocked User successfully"
                })
            }
            else {
                return res.json({
                    success: false,
                    message: "Failed to remove blocked user"
                })
            }
        }
        else 
        {
            return res.json({
                success: false,
                message: "Failed to find type"
            })
        }
}

// fetch block list
exports.fetch_blocked_people = async (req, res, next) => {
        const current_user = req.user_id;
        let BlockedUsers = await blockschema.distinct("Blocked_user",{ Blocked_by: current_user }).exec();
        const totalBlockedUsers = await Users.find({_id: BlockedUsers},{_id: 1,username: 1, name: 1, avatar: 1}).exec();
        
        if (totalBlockedUsers.length > 0) 
        {
            return res.json({
                success: true,
                result: totalBlockedUsers,
                message: "Blocked users fetched successfullly"

            })
        }
        else {
            return res.json({
                success: false,
                result: totalBlockedUsers,
                message: "No blocked users"
            })
        }
}

//findBlockedUser
exports.findBlockedUser = async (req, res, next) => {
        const current_userId = req.user_id;
        const UnBlock_userID = req.query.user_Id;

        let BlockedUsers = await blockschema.distinct("Blocked_user",{ Blocked_by: current_userId }).exec();
        if (BlockedUsers.length) {
            var change_string = BlockedUsers.toString();
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

}