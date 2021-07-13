const express = require("express");
const { tagged_post } = require("../../controllers/User/userTagpost");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/getTaggedPost",
    checkSession,
    checkIsactive,
    tagged_post
)

module.exports = router;
