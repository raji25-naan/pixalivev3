const express = require("express");
const { user_allPost, user_reloopPost, user_taggedPost, trending_post, trending_postByCategory } = require("../../controllers/User/user_profile");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get("/user_allpost",
    checkSession,
    checkIsactive,
    checkQuery("user_id"),
    validateRequest,
    catch_error(user_allPost)
)

router.get("/user_reloopPost",
    checkSession,
    checkIsactive,
    checkQuery("user_id"),
    validateRequest,
    catch_error(user_reloopPost)
)

router.get("/user_taggedPost",
    checkSession,
    checkIsactive,
    checkQuery("user_id"),
    validateRequest,
    catch_error(user_taggedPost)
)

router.get("/trending_post",
    checkSession,
    checkIsactive,
    catch_error(trending_post)
)

router.get("/trending_postByCategory",
    checkSession,
    checkIsactive,
    checkQuery("category_name"),
    checkQuery("loop"),
    validateRequest,
    catch_error(trending_postByCategory)
)
module.exports = router;