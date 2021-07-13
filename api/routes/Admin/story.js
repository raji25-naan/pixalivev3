const express = require("express");
const { getstory, getstory_date, active_story, deactive_story } = require("../../controllers/Admin/story");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.get("/getstory", getstory);
router.get("/getstory_date", getstory_date);
router.post("/active_story", active_story);
router.post("/deactive_story", deactive_story);


module.exports = router