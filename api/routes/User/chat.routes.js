
const express = require("express");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkQuery,
} = require("../../middlewares/validator");

const { messages, user_messages, deleteSingleChat, find_block, reportIndividualUser, deleteAllChat, block_chatuser, unblock_chatuser, suggestionChat } = require("../../controllers/User/chat");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkIsactive } = require("../../middlewares/checkActive");

router.get("/messages",
  checkSession,
  checkIsactive,
  messages);

router.get("/user_messages",
  checkSession,
  checkIsactive,
  checkQuery("user_id"),
  validateRequest,
  user_messages);

//deleteSingleChat
router.post("/deleteSingleChat",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("id"),
  checkRequestBodyParams("createdAt"),
  checkRequestBodyParams("type"),
  validateRequest,
  deleteSingleChat
)

//deleteAllChat
router.post("/deleteAllChat",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("senderId"),
  checkRequestBodyParams("receiverId"),
  validateRequest,
  deleteAllChat
)

//reportIndividualUser
router.post("/reportIndividualUser",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("id"),
  checkRequestBodyParams("report"),
  validateRequest,
  reportIndividualUser
)

// Block_user
router.post("/block_chatuser",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_Id"),
  validateRequest,
  block_chatuser
)

// UnBlock_user
router.post("/unblock_chatuser",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_Id"),
  validateRequest,
  unblock_chatuser
)

// UnBlock_user
router.get("/find_block",
  checkSession,
  checkIsactive,
  checkQuery("user_Id"),
  validateRequest,
  find_block
)

//suggestionChat
router.get("/suggestionChat",
  checkSession,
  checkIsactive,
  suggestionChat
)

module.exports = router;