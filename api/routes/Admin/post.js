const express = require("express");
const { getAllPost, getPostDetail, create_postNew, activatepost, deactivatepost } = require("../../controllers/Admin/post");
const { checkQuery,checkRequestBodyParams, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/create_post", create_postNew);

router.get("/getAllPost",getAllPost);

router.get("/getPostDetail",checkQuery("post_id"),validateRequest,getPostDetail);

router.post("/activatepost",checkRequestBodyParams("post_id"),validateRequest, activatepost);

router.post("/deactivatepost",checkRequestBodyParams("post_id"),validateRequest, deactivatepost);



module.exports = router;