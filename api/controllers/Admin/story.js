const Story = require("../../models/User/story");
const moment = require("moment");
const momentTimeZone = require("moment-timezone");
const { trending_post } = require("../User/user_profile");


exports.getstory = async (req, res) => {

    try {
        const Allstories = await Story.find({
            $and: [
                { storyDisappearTime: { $gt: moment(momentTimeZone().tz('Asia/kolkata')).toDate() } }]
        }).populate("user_id", "username avatar name private follow").sort({ createdAt: -1 }).exec();
        if (Allstories.length > 0) {
            return res.json({
                success: true,
                result: Allstories,
                msg: "Stories are fetched successfully"
            })
        }
    } catch (error) {
        return res.json({
            success: false,
            msg: "error Occured!" + error
        })
    }
}

exports.getstory_date = async(req,res,next)=>{
    try{
        const created_at = new Date(req.query.date);
         const end = new Date(created_at);
     end.setHours(23,59,59,999)
     console.log(end)
const findDate = await Story.find({created_at:{$gte:created_at,$lte:end}})
       
       if(findDate.length>0){
           return res.json({
               success:true,
               result:findDate,
               msg:"find the stories"
           })
       }else{
           return res.json({
               msg:"error"
           })
       }
    }catch{
        return res.json({
            success:false,
            msg:"error Occured!"
        })
    }
}

exports.active_story = async (req, res) => {
    try {
        const story_id = req.body.story_id;
        const activeuser = await Story.updateOne(
            { _id: story_id },
            {
                $set: { isActive: true }
            },
            { new: true }
        ).exec();
        if (activeuser) {
            return res.json({
                success: true,
                msg: "story activated"
            })
        }
        else {
            return res.json({
                success: false,
                msg: "Not activated"
            })
        }
    } catch (error) {
        return res.json({
            success: false,
            msg: "error Occured!" + error
        })
    }

}

exports.deactive_story = async (req, res) => {
    try {
        const story_id = req.body.story_id;
        const activeuser = await Story.updateOne(
            { _id: story_id },
            {
                $set: { isActive: false }
            },
            { new: true }
        ).exec();
        if (activeuser) {
            return res.json({
                success: true,
                msg: "story Deactivated"
            })
        }
        else {
            return res.json({
                success: false,
                msg: "Not Deactivated"
            })
        }
    } catch (error) {
        return res.json({
            success: false,
            msg: "error Occured!" + error
        })
    }

}