const express = require("express");
const router = express.Router();
const { oneOf } = require("express-validator/check");
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const {
  create_postNew,
  get_post,
  delete_post,
  feeds,
  updateviewpost,
  createReport,
  getPostsbycategory,
  reloopPost,
  hidePost,
  editPost,
  edit_privacy,
  delete_post_New,
  createShare
} = require("../../controllers/User/Post");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkIsactive } = require("../../middlewares/checkActive");
const { increaseShare_Point, trendingPeople } = require("../../controllers/User/points");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


//post_new
router.post(
  "/post_new",
  checkSession,
  checkIsactive,
  oneOf([checkRequestBodyParams("url"), checkRequestBodyParams("text")]),
  validateRequest,
  catch_error(create_postNew)
);

//reloopPost
router.post(
  "/reloopPost",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  validateRequest,
  catch_error(reloopPost)
);

// Get post by id
router.get(
  "/getPost",
  checkSession,
  checkIsactive,
  checkQuery("post_id"),
  validateRequest,
  catch_error(get_post)
);

// Get user posts
// router.get(
//   "/postbyUid",
//   checkSession,
//   checkIsactive,
//   user_posts
// );

// get single user feed
router.get(
  "/feeds",
  checkSession,
  checkIsactive,
  catch_error(feeds)
);

//updateviewpost
router.post(
  "/updateviewpost",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  checkRequestBodyParams("postUserId"),
  validateRequest,
  catch_error(updateviewpost)
);

//createReport
router.post(
  "/createReport",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  checkRequestBodyParams("report"),
  validateRequest,
  catch_error(createReport)
);

//getPostsbycategory
// router.get(
//   "/getPostsbycategory",
//   checkSession,
//   checkIsactive,
//   checkQuery("post_id"),
//   validateRequest,
//   getPostsbycategory
// );


//HidePost
router.post(
  "/hidePost",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  validateRequest,
  catch_error(hidePost)
);

//editPost
router.post(
  "/editPost",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  validateRequest,
  catch_error(editPost)
)

//increaseShare_Point
router.post(
  "/increaseSharePoint",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  validateRequest,
  catch_error(increaseShare_Point)
)


// update_post privacy
router.post(
  "/edit_privacy",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("post_id"),
  checkRequestBodyParams("privacy_type"),
  validateRequest,
  catch_error(edit_privacy)
)

//trendingPeople
router.get(
  "/trendingPeople",
  checkSession,
  checkIsactive,
  catch_error(trendingPeople)
)

// DeletePost
router.post(
  "/delete_post_New",
  checkSession,
  checkRequestBodyParams("post_id"),
  validateRequest,
  delete_post_New
);
// createShare

router.post(
  "/createShare",
  createShare
);

module.exports = router;
