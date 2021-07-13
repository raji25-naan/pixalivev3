const express = require("express");
const { block_unblock_people, fetch_blocked_people, check, findBlockedUser } = require("../../controllers/User/block_user");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest,checkQuery, checkRequestBodyParams } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


router.post("/block_unblock_people",
    checkSession,
    checkIsactive,
    checkRequestBodyParams("user_id"),
    checkRequestBodyParams("type"),
    validateRequest,
    catch_error(block_unblock_people)
    );

router.get("/fetch_blocked_people",
    checkSession,
    checkIsactive,
    catch_error(fetch_blocked_people)
    );

router.get("/findBlockedUser",
    checkSession,
    checkIsactive,
    checkQuery('user_Id'),
    validateRequest,
    catch_error(findBlockedUser)
    );



module.exports = router;