const express = require("express");
const { oneOf } = require("express-validator/check");
const {
  signup,
  login,
  changepassword,
  user_info,
  is_user,
  updateProfile,
  forgotpassword,
  resetpassword,
  resetPasswordVerifyOtp,
  gcm_token_updation,
  search_place,
  upload_avatar,
  change_avatar,
  search,
  search_user,
  socialLogin,
  contactSync,
  getPostBySearchPlace,
  checkPhoneVerify,
  checkEmailVerify,
  getUserDetails
} = require("../../controllers/User/User");
const { checkIsactive } = require("../../middlewares/checkActive");
const { checkSession } = require("../../middlewares/checkAuth");
const router = express.Router();
const {
  checkRequestBodyParams,
  validateRequest,
  checkParam,
  checkQuery,
} = require("../../middlewares/validator");
const verifiedEmail_Phone = require("../../models/User/verifiedEmail_Phone");
const catch_error = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// router.post("/create",async(req,res)=>{

//   const data = await new verifiedEmail_Phone({
//     verifiedPhone : [],
//     verifiedEmail : []
//   }).save();

//   if(data)
//   {
//     return res.send({message: "Success!"})
//   }
// })

//checkPhoneVerify
router.post(
  "/checkPhoneVerify",
  checkRequestBodyParams("country_code"),
  checkRequestBodyParams("phone"),
  validateRequest,
  catch_error(checkPhoneVerify)
)

//checkEmailVerify
router.post(
  "/checkEmailVerify",
  checkRequestBodyParams("email"),
  validateRequest,
  catch_error(checkEmailVerify)
)

//signup
router.post(
  "/signup",
  checkRequestBodyParams("name"),
  oneOf([checkRequestBodyParams("phone"), checkRequestBodyParams("email")]),
  checkRequestBodyParams("password"),
  checkRequestBodyParams("DOB"),
  checkRequestBodyParams("gender"),
  validateRequest,
  catch_error(signup)
);

//login
router.post(
  "/login",
  oneOf([checkRequestBodyParams("phone"), checkRequestBodyParams("email")]),
  checkRequestBodyParams("password"),
  validateRequest,
  catch_error(login)
);

//facebook and google login
router.post(
  "/social-login",
  oneOf([checkRequestBodyParams("phone"), checkRequestBodyParams("email")]),
  validateRequest,
  catch_error(socialLogin)
);

//changepassword
router.post(
  "/changepassword",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("oldpassword"),
  checkRequestBodyParams("newpassword"),
  checkRequestBodyParams("confirmpassword"),
  validateRequest,
  catch_error(changepassword)
);

//userInfo
router.get(
  "/userInfo",
  checkSession,
  checkIsactive,
  checkQuery("user_id"),
  validateRequest,
  catch_error(user_info)
);

router.post(
  "/is_user",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("phone"),
  validateRequest,
  catch_error(is_user)
);

//updateProfile
router.post(
  "/updateProfile",
  checkSession,
  checkIsactive,
  catch_error(updateProfile)
);

//reset_passwordstep1
router.post(
  "/forgotpassword",
  oneOf([checkRequestBodyParams("phone"), checkRequestBodyParams("email")]),
  validateRequest,
  catch_error(forgotpassword)
);

//resetPasswordVerifyOtp
router.post(
  "/resetPasswordVerifyOtp",
  checkRequestBodyParams("otp"),
  checkRequestBodyParams("token"),
  validateRequest,
  resetPasswordVerifyOtp
);

//resetPassword
router.post(
  "/resetPassword",
  checkRequestBodyParams("token"),
  checkRequestBodyParams("password"),
  checkRequestBodyParams("confirmPassword"),
  validateRequest,
  resetpassword
);

//UpdateGcmtoken
router.post(
  "/update_gcmToken",
  checkSession,
  checkIsactive,
  checkRequestBodyParams("user_id"),
  checkRequestBodyParams("token"),
  validateRequest,
  catch_error(gcm_token_updation)
);

// Search user
router.get(
  "/search_user",
  checkSession,
  checkIsactive,
  catch_error(search_user)
);

// Search place
router.get(
  "/search_place",
  checkSession,
  checkIsactive,
  catch_error(search_place)
);

// #1 - Upload avatar
router.post(
  "/upload_avatar",
  checkSession,
  checkIsactive,
  catch_error(upload_avatar)
);

// update avatar
router.post(
  "/change_avatar",
  checkSession,
  checkIsactive,
  catch_error(change_avatar)
);

// search
router.get(
  "/search",
  checkSession,
  checkIsactive,
  oneOf([checkQuery("search_user"), checkQuery("search_hashtag"), checkQuery("search_category")]),
  validateRequest,
  catch_error(search)
);

//getPostBySearchPlace
router.get("/getPostBySearchPlace",
  checkSession,
  checkIsactive,
  checkQuery("place"),
  validateRequest,
  catch_error(getPostBySearchPlace)
)

// contactSync
router.post(
  "/contactSync",
  checkSession,
  checkIsactive,
  catch_error(contactSync)
)

//getUserDetails
router.get("/getUserDetails",
  checkSession,
  checkIsactive,
  catch_error(getUserDetails)
)

module.exports = router;
