const express = require("express");
const { createCategory, fetchCategory, sendFeedback } = require("../../controllers/User/category");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { validateRequest,checkRequestBodyParams } = require("../../middlewares/validator");
const router = express.Router();
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post("/createCategory",catch_error(createCategory));

router.get("/fetchCategory",
            checkSession,
            checkIsactive,
            catch_error(fetchCategory)
            );


//feedBack
router.post("/sendFeedback",
            checkSession,
            checkIsactive,
            checkRequestBodyParams("username"),
            checkRequestBodyParams("user_id"),
            checkRequestBodyParams("text"),
            validateRequest,  
            catch_error(sendFeedback)
            )


module.exports = router