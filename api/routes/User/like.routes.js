const express = require("express");
const { add_like, liked_post } = require("../../controllers/User/like");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams,validateRequest } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


router.post('/likePost',
            checkSession,
            checkIsactive,
            checkRequestBodyParams('type').isIn(['1', '0']),
            checkRequestBodyParams('post_id'),
            validateRequest,
            catch_error(add_like)
)

router.post('/getLikedPosts',
            checkSession,
            checkIsactive,
            catch_error(liked_post)
)


module.exports = router