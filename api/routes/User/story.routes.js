const express = require("express");
const { updateViewedStories, getStory, commentstory, StoriesUpload, getStoryById, deleteStory, createStoryReport, getViewedUsersByStory, addLiketoStory, getStoryByStoryId } = require("../../controllers/User/story");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);


router.post(
  "/updateViewedStories",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("storyId"),
  validateRequest,
  catch_error(updateViewedStories)
);

router.get(
  "/getViewedUsersByStory",
  checkSession,
  checkIsactive,
  checkQuery("storyId"),
  validateRequest,
  catch_error(getViewedUsersByStory)
)

router.post(
  "/addStories",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("url"),
  validateRequest,
  catch_error(StoriesUpload)
);

router.get(
  "/getStory",
  checkSession,
  checkIsactive,
  catch_error(getStory)
);

//getStoryById
router.get(
  "/getStoryById",
  checkSession,
  checkIsactive,
  checkQuery("user_id"),
  validateRequest,
  catch_error(getStoryById)
)

//getStoryByStoryId
router.get(
  "/getStoryByStoryId",
  checkSession,
  checkIsactive,
  checkQuery("story_id"),
  validateRequest,
  catch_error(getStoryByStoryId)
)

//deleteStory
router.post(
  "/deleteStory",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("story_id"),
  validateRequest,
  catch_error(deleteStory)
)

//createStoryReport
router.post(
  "/createStoryReport",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("story_id"),
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("report"),
  validateRequest,
  catch_error(createStoryReport)
)

//addLiketoStory
router.post('/addLiketoStory',
  checkSession,
  checkIsactive,
  checkRequestBodyParams('type').isIn(['1', '0']),
  checkRequestBodyParams('story_id'),
  validateRequest,
  catch_error(addLiketoStory)
)

router.post(
  "/commentstory",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("story_id"),
  checkRequestBodyParams("receiver_id"),
  checkRequestBodyParams("sender_id"),
  checkRequestBodyParams("post_type"),
  validateRequest,
  catch_error(commentstory)
);

module.exports = router