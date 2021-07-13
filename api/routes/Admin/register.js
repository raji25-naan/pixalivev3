const express = require("express");
const { login, getAllUsers, deactivateUser, activateUser, getUserDetail, signup } = require("../../controllers/Admin/register");
const { checkSession } = require("../../middlewares/checkAuth");
const { checkRequestBodyParams, checkQuery, validateRequest } = require("../../middlewares/validator");
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);

router.get("/getAllUsers", getAllUsers);

router.post("/activateUser",
    checkRequestBodyParams('userId'),
    validateRequest,
    activateUser);

router.post("/deactivateUser",
    checkRequestBodyParams('userId'),
    validateRequest,
    deactivateUser);

router.get("/getUserDetail",
    checkQuery('userId'),
    validateRequest,
    getUserDetail);

module.exports = router