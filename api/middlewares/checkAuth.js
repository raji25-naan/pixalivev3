const jwt = require("jsonwebtoken");

//User Session Token
module.exports.checkSession = async (req, res, next) => {
    const token = req.headers['token'];
    if (token) {
        const headerType = token.split(' ')[0];
        const tokenValue = token.split(' ')[1].trim();
        if (headerType.trim() === "Bearer") {
            try {
                const decodedId = await jwt.verify(tokenValue, process.env.JWT_KEY);
                // // console.log('decodedId  is ', decodedId);
                if (decodedId) {
                    next();
                } else {
                    return res.status(401).json({
                        success: false,
                        statusCode: 499,
                        message: "Unauthorized"
                    });
                }
            } catch (err) {
                console.error(err);
                return res.status(401).json({
                    success: false,
                    statusCode: 499,
                    message: "Unauthorized"
                })
            }
        }
    } else {
        return res.status(401).json({
            success: false,
            statusCode: 499,
            message: "Unauthorized"
        })
    }
}