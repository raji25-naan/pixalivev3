const express = require("express");
const { createFollowNew, update_follow, mutualFriendList, get_following, get_followers, suggestionFriendList, DiscoverPeople } = require("../../controllers/User/follow_unfollow");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, validateRequest, checkParam, checkQuery } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/mutuals',
    checkSession,
    checkIsactive,
    checkQuery('id'),
    validateRequest,
    catch_error(mutualFriendList)
)

router.get('/get_following',
    checkSession,
    checkIsactive,
    checkQuery('id'),
    validateRequest,
    catch_error(get_following)
)

router.get('/get_followers',
    checkSession,
    checkIsactive,
    checkQuery('id'),
    validateRequest,
    catch_error(get_followers)
)

router.get('/suggestionFriendList',
    checkSession,
    checkIsactive,
    catch_error(suggestionFriendList)
)

//createFollowNew
router.post('/createFollowNew',
    checkSession,
    checkIsactive,
    checkRequestBodyParams('type').isIn(['1', '0']),
    checkRequestBodyParams('following_id'),
    validateRequest,
    catch_error(createFollowNew)
)

//update_follow
router.post('/update_follow',
    checkSession,
    checkIsactive,
    checkRequestBodyParams('type').isIn(['1', '0']),
    checkRequestBodyParams('follower_Id'),
    catch_error(update_follow)
)

//DiscoverPeople
router.get("/DiscoverPeople",
    checkSession,
    checkIsactive,
    catch_error(DiscoverPeople)
)

module.exports = router