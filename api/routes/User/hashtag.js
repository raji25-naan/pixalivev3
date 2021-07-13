const express = require("express");
const { followUnfollowHashtag, create_hashtag, fetch_hashtag, getvideo_hashtag, getPostByhashtag } = require("../../controllers/User/hashtag");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


router.post("/follow_unfollow_hashtag",
    checkSession,
    checkIsactive,
    checkRequestBodyParams('type').isIn(['1', '0']),
    checkRequestBodyParams("hashId"),
    checkRequestBodyParams("hashtag"),
    validateRequest,
    catch_error(followUnfollowHashtag)
)

router.post("/create_hashtag",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("hashtag"),
    validateRequest,
    catch_error(create_hashtag)
)

router.post("/fetch_hashtag",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("search_hash"),
    validateRequest,
    catch_error(fetch_hashtag)
)

//getPostByhashtag
router.post("/getPostByhashtag",
    checkSession,
    checkIsactive,
    catch_error(getPostByhashtag)
)

// get video post using hashtag
router.post("/getvideo_hashtag",
    checkSession,
    checkIsactive,
    catch_error(getvideo_hashtag)
)

module.exports = router;