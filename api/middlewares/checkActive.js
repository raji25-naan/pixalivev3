const jwt = require("jsonwebtoken");
const User = require("../models/User/Users");

module.exports.checkIsactive = async(req,res,next)=>{

    const token = req.headers['token'];
    if(token)
    {
        const headerType = token.split(' ')[0];
        const tokenValue = token.split(' ')[1].trim();
        if (headerType.trim() === "Bearer") 
        {
            const decodedId = await jwt.verify(tokenValue, process.env.JWT_KEY);
            let user_id = decodedId.user.id;
            //checkActive
            const checkActive = await User.findOne({_id:user_id,isActive : true}).exec();
            if(checkActive)
            {
                req["user_id"] = user_id;
                next();
            }
            else
            {
                return res.status(401).json({
                    success: false,
                    statusCode: 499,
                    message: "Your account is not active"
                })
            }
        }
        else
        {
            return res.status(401).json({
                success: false,
                statusCode: 499,
                message: "Your account is not active"
            }) 
        }
    }
    else
    {
        return res.status(401).json({
            success: false,
            statusCode: 499,
            message: "Your account is not active"
        })
    }
}