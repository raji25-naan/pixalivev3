const moment = require("moment");
const Users = require("../../models/User/Users");
const followSchema = require("../../models/User/follow_unfollow");
const postSchema = require("../../models/User/Post");
const likeSchema = require("../../models/User/like");
const Hashtag = require("../../models/User/hashtags");
const verifiedPhoneEmail = require("../../models/User/verifiedEmail_Phone");
const bcrypt = require("bcrypt");
const {
  SendEmailVerificationLink,
} = require("../../helpers/UniversalFunctions");
const jwt = require("jsonwebtoken");
const { verifyGCMToken } = require("../../helpers/notification");
const twillio = require("../../helpers/smsManager");
let Twillio = new twillio();
const emailValidator = require("email-validator");
const sleep = require('sleep-promise');
const pointSchema = require("../../models/User/points");
const blocked = require("../../models/User/blocked");

//checkPhoneVerify
exports.checkPhoneVerify = async (req, res, next) => {

  let country_code = req.body.country_code;
  let phone = req.body.phone;
  //validPhone
  if (phone.length != 10) {
    return res.json({
      success: false,
      message: "Please enter valid phone number",
    });
  }
  //checkPhone
  let MobileNo = country_code + phone;
  console.log(MobileNo);
  const checkPhone = await verifiedPhoneEmail.findOne({ verifiedPhone: MobileNo }).exec();
  console.log(checkPhone);
  if (checkPhone !== null) {
    return res.json({
      success: false,
      message: "Mobile number already registered with us!"
    });
  }
  else {
    let otp = Math.floor(1000 + Math.random() * 9000);
    Twillio.sendOtp(otp, country_code + phone);
    sleep(1000).then(function () {
      return res.json({
        success: true,
        OTP: otp,
        message: "OTP sent successfully to your mobile number"
      });
    });
  }
}

//checkEmailVerify
exports.checkEmailVerify = async (req, res, next) => {

  let email = req.body.email;
  //validEmail
  const validEmail = emailValidator.validate(email);
  if (!validEmail) {
    return res.json({
      success: false,
      message: "Please enter valid email",
    });
  }
  //checkEmail
  const checkEmail = await verifiedPhoneEmail.findOne({ verifiedEmail: email }).exec();
  console.log(checkEmail);
  if (checkEmail !== null) {
    return res.json({
      success: false,
      message: "Email already registered with us!"
    });
  }
  else {
    let otp = Math.floor(1000 + Math.random() * 9000);
    SendEmailVerificationLink(otp, req, email);
    sleep(1000).then(function () {
      return res.json({
        success: true,
        OTP: otp,
        message: "OTP sent successfully to your email id"
      });
    });
  }
}

//signup
exports.signup = async (req, res, next) => {
  let {
    name,
    phone,
    email,
    password,
    gender,
    DOB,
    country_code,
    avatar,
    facebook_signin,
    google_signin
  } = req.body;

  if (req.body.email) {
    //validEmail
    const validEmail = emailValidator.validate(email);
    if (!validEmail) {
      return res.json({
        success: false,
        message: "Please enter valid email"
      });
    }
    //checkUserinfo
    const userInfo = await Users.findOne({ email: email });
    if (userInfo) {
      if (email == userInfo.email) {
        return res.json({
          success: false,
          message: "Email already regitered!"
        });
      }
    }
    else {
      let a = new Date().valueOf();
      let userRandom = a.toString().slice(-3);
      let username = name + userRandom;
      let userData;
      userData = {
        name: name,
        username: username,
        email: email,
        password: bcrypt.hashSync(password, 12),
        avatar: avatar,
        gender: gender,
        DOB: DOB,
        email_verified: true,
        gcm_token: "",
        facebook_signin: facebook_signin,
        google_signin: google_signin,
        isActive: true,
        created_At: Date.now()
      };
      const data = new Users(userData);
      const saveData = await data.save();
      if (saveData) {
        //createPointSchema
        const createPointSchema = new pointSchema({ _id: saveData._id });
        await createPointSchema.save();
        //updateverifiedEmail
        const updateverifiedEmail = await verifiedPhoneEmail.updateOne({
          $push: { verifiedEmail: saveData.email }
        });
        return res.json({
          success: true,
          user_id: saveData._id,
          message: "Account registered successfully!"
        });
      } else {
        return res.json({
          success: false,
          message: "Error occured!" + error,
        });
      }
    }
  }
  else if (req.body.phone) {
    console.log("Phone");
    //validPhoneno
    if (phone.length != 10) {
      return res.json({
        success: false,
        message: "Please enter valid phone number",
      });
    }
    //checkuserInfo
    const userInfo = await Users.findOne({ phone: phone, phone_verified: true });
    if (userInfo) {
      if (phone == userInfo.phone) {
        return res.json({
          success: false,
          message: "Mobile number already regitered!"
        });
      }
    }
    else {
      let a = new Date().valueOf();
      let userRandom = a.toString().slice(-3);
      let username = name + userRandom;
      let userData;
      userData = {
        name: name,
        username: username,
        phone: phone,
        country_code: country_code,
        password: bcrypt.hashSync(password, 12),
        avatar: avatar,
        gender: gender,
        DOB: DOB,
        phone_verified: true,
        gcm_token: "",
        facebook_signin: facebook_signin,
        google_signin: google_signin,
        isActive: true,
        created_At: Date.now(),
      };
      const data = new Users(userData);
      const saveData = await data.save();
      if (saveData) {
        //createPointSchema
        const createPointSchema = new pointSchema({ _id: saveData._id });
        await createPointSchema.save();
        //updateverifiedPhone
        let MobileNo = saveData.country_code + saveData.phone;
        const updateverifiedPhone = await verifiedPhoneEmail.updateOne({
          $push: { verifiedPhone: MobileNo }
        });
        return res.json({
          success: true,
          user_id: saveData._id,
          message: "Account registered successfully!"
        });
      }
      else {
        return res.json({
          success: false,
          message: "Error occured!" + error,
        });
      }
    }
  }
};

//login
exports.login = async (req, res, next) => {
  let { phone, email, password } = req.body;
  if (req.body.phone) {
    const data = await Users.findOne({ phone: phone, phone_verified: true }).exec();
    if (data) {
      if (data.isActive == false) {
        return res.json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const matched = await bcrypt.compare(password, data.password);
      if (!matched) {
        return res.json({
          success: false,
          message: "Invalid credentials!",
        });
      } else {
        const payload = {
          user: {
            id: data._id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });

        if (token) {
          return res.json({
            success: true,
            user: {
              _id: data._id,
              name: data.name,
              username: data.username,
              email: data.email,
              country_code: data.country_code,
              phone: data.phone,
              avatar: data.avatar,
              gender: data.gender,
              DOB: data.DOB,
              bio: data.bio,
              followingCount: data.followingCount
            },
            token: token,
            message: "you have logged in successfully"
          });
        }
      }
    }
    else {
      return res.json({
        success: false,
        message: "you are not registered with us!",
      });
    }
  }
  else if (req.body.email) {
    const data = await Users.findOne({ email: email, email_verified: true }).exec();
    if (data) {
      if (data.isActive == false) {
        return res.json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const matched = await bcrypt.compare(password, data.password);
      if (!matched) {
        return res.json({
          success: false,
          message: "Invalid credentials!",
        });
      } else {
        const payload = {
          user: {
            id: data._id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_KEY, {
          expiresIn: "90d",
        });

        if (token) {
          return res.json({
            success: true,
            user: {
              _id: data._id,
              name: data.name,
              username: data.username,
              email: data.email,
              country_code: data.country_code,
              phone: data.phone,
              avatar: data.avatar,
              gender: data.gender,
              DOB: data.DOB,
              bio: data.bio,
              followingCount: data.followingCount
            },
            token: token,
            message: "you have logged in successfully"
          });
        }
      }
    }
    else {
      return res.json({
        success: false,
        message: "you are not registered with us!",
      });
    }
  }
};

//social-login
exports.socialLogin = async (req, res, next) => {

  let { phone, email } = req.body;
  if (req.body.phone) {
    const data = await Users.findOne({ phone: phone, phone_verified: true }).exec();
    if (data) {
      if (data.isActive == false) {
        return res.json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const payload = {
        user: {
          id: data._id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: "90d",
      });

      if (token) {
        return res.json({
          success: true,
          user: {
            _id: data._id,
            name: data.name,
            username: data.username,
            email: data.email,
            country_code: data.country_code,
            phone: data.phone,
            avatar: data.avatar,
            gender: data.gender,
            DOB: data.DOB,
            bio: data.bio,
            followingCount: data.followingCount
          },
          token: token,
          message: "you have logged in successfully"
        });
      }
    }
    else {
      return res.json({
        success: false,
        message: "you are not registered with us! Please Signup..",
      });
    }
  }
  else if (req.body.email) {
    const data = await Users.findOne({ email: email, email_verified: true }).exec();
    if (data) {
      if (data.isActive == false) {
        return res.json({
          success: false,
          statusCode: 499,
          message: "Your account is not active"
        })
      }
      const payload = {
        user: {
          id: data._id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_KEY, {
        expiresIn: "90d",
      });

      if (token) {
        return res.json({
          success: true,
          user: {
            _id: data._id,
            name: data.name,
            username: data.username,
            email: data.email,
            country_code: data.country_code,
            phone: data.phone,
            avatar: data.avatar,
            gender: data.gender,
            DOB: data.DOB,
            bio: data.bio,
            followingCount: data.followingCount
          },
          token: token,
          message: "you have logged in successfully"
        });
      }
    }
    else {
      return res.json({
        success: false,
        message: "you are not registered with us! Please Signup..",
      });
    }
  }
};

//changePassword
exports.changepassword = async (req, res, next) => {

  const { oldpassword, newpassword, confirmpassword, user_id } = req.body;
  //getUserInfo
  const getUserInfo = await Users.findById({ _id: user_id });
  const matched = await bcrypt.compare(oldpassword, getUserInfo.password);

  if (!matched) {
    return res.json({
      success: false,
      message: "old password is incorrect",
    });
  } else {
    if (newpassword == confirmpassword) {
      const data = await Users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: { password: bcrypt.hashSync(newpassword, 12) },
        },
        { new: true }
      );
      if (data) {
        return res.json({
          success: true,
          message: "Password successfully changed!",
        });
      } else {
        return res.json({
          success: false,
          message: "Error occured!",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Passwords are doesn't matched",
      });
    }
  }
};

//Get user info
exports.user_info = async (req, res, next) => {

  let user_id = req.user_id;
  let getUserInfo = await Users.findOne({ _id: req.query.user_id, isActive: true }).exec();
  let getUserPosts = await postSchema.find({ user_id: req.query.user_id, isActive: true, isDeleted: false }).exec();
  //getFriendslist
  const data_follower = await followSchema.distinct("followingId", {
    followerId: user_id,
    status: 1
  });
  var array1 = data_follower.map(String);
  var uniq_id = [...new Set(array1)];
  //data_request
  const data_request = await followSchema.distinct("followingId", {
    followerId: user_id,
    status: 0
  });
  var array2 = data_request.map(String);
  var requested = [...new Set(array2)];
  //follow1
  uniq_id.forEach((main_data) => {
    if (main_data == getUserInfo._id) {
      getUserInfo.follow = 1;
    }
  });
  //follow2
  requested.forEach((main_data) => {
    if (main_data == getUserInfo._id) {
      getUserInfo.follow = 2;
    }
  });
  var obj_set = { posts: getUserPosts.length };
  const obj = Object.assign({}, getUserInfo._doc, obj_set);
  if (obj) {
    sleep(2000).then(function () {
      return res.json({
        success: true,
        user: obj,
        message: "successfully fetched user information"
      });
    });

  } else {
    return res.json({
      success: false,
      message: "User not found",
    });
  }
};

//is_user
exports.is_user = async (req, res, next) => {

  const getUserData = await Users.findOne({ phone: req.body.phone, isActive: true });
  if (getUserData) {
    return res.json({
      success: true,
      result: getUserData,
      message: "successfully fetched user information",
    });
  } else {
    return res.json({
      success: false,
      message: "User not found",
    });
  }
};

//updateProfile
exports.updateProfile = async (req, res, next) => {

  let user_id = req.user_id;
  let editData = {};
  // const myUserData = await Users.findOne({ _id: user_id });
  // if (req.body.email || req.body.phone || req.body.username) {
  //   if (req.body.email !== undefined) {
  //     const validateEmail = emailValidator.validate(req.body.email);
  //     if (!validateEmail) {
  //       return res.json({
  //         success: false,
  //         message: "Please enter valid email",
  //       });
  //     }
  //     const userEmailDetail = await Users.findOne({ email: req.body.email });
  //     console.log(userEmailDetail)
  //     if (req.body.email == myUserData.email) {
  //       editData["email"] = req.body.email;
  //     } else if (userEmailDetail) {
  //       return res.json({
  //         success: false,
  //         message: "Email already taken!",
  //       });
  //     }
  //   }
  //   if (req.body.phone !== undefined) {
  //     if (req.body.phone.length != 10) {
  //       return res.json({
  //         success: false,
  //         message: "Please enter valid phone number",
  //       });
  //     }
  //     const userPhoneNoDetail = await Users.findOne({
  //       phone: req.body.phone,
  //     });
  //     if (req.body.phone == myUserData.phone) {
  //       editData["phone"] = req.body.phone;
  //     } else if (userPhoneNoDetail) {
  //       return res.json({
  //         success: false,
  //         message: "Phone Number already taken!",
  //       });
  //     }
  //   }
  //   if (req.body.username !== undefined) {
  //     const userNameDetail = await Users.findOne({
  //       username: req.body.username
  //     });
  //     if (req.body.username == myUserData.username) 
  //     {
  //       editData["username"] == req.body.username;
  //     }
  //      else if (userNameDetail) {
  //       return res.json({
  //         success: false,
  //         message: "already exists Username!",
  //       });
  //     }
  //   }
  // }
  editData["phone"] = req.body.phone;
  editData["username"] = req.body.username;
  editData["name"] = req.body.name;
  editData["isemail"] = req.body.isemail;
  editData["email"] = req.body.email;
  editData["email_verified"] = req.body.email_verified;
  editData["country_code"] = req.body.country_code;
  editData["isphone"] = req.body.isphone;
  editData["phone_verified"] = req.body.phone_verified;
  editData["phone"] = req.body.phone;
  editData["avatar"] = req.body.avatar;
  editData["bio"] = req.body.bio;
  editData["private"] = req.body.private;
  editData["CurrentLocation"] = req.body.CurrentLocation;
  editData["Location"] = req.body.Location;
  editData["profession"] = req.body.profession;
  editData["Website"] = req.body.Website;
  editData["MaritalStatus"] = req.body.MaritalStatus;
  editData["isQualification"] = req.body.isQualification;
  editData["Qualification"] = req.body.Qualification;
  editData["isWorkExperience"] = req.body.isWorkExperience;
  editData["WorkExperience"] = req.body.WorkExperience;
  editData["updated_At"] = Date.now();
  const updateData = await Users.findByIdAndUpdate(
    { _id: user_id },
    {
      $set: editData
    },
    { new: true }
  );
  if (updateData) {
    //updateverifiedPhone
    if (req.body.phone) {
      let MobileNo = req.body.country_code + req.body.phone;
      const checkPhone = await verifiedPhoneEmail.findOne({ verifiedPhone: MobileNo }).exec();
      if (checkPhone == null) {
        const updateverifiedPhone = await verifiedPhoneEmail.updateOne({
          $push: { verifiedPhone: MobileNo }
        });
      }
    }
    //updateverifiedEmail
    if (req.body.email) {
      const checkEmail = await verifiedPhoneEmail.findOne({ verifiedEmail: req.body.email }).exec();
      if (checkEmail == null) {
        const updateverifiedEmail = await verifiedPhoneEmail.updateOne({
          $push: { verifiedEmail: req.body.email }
        });
      }
    }
    return res.json({
      success: true,
      result: updateData,
      message: "Profile updated successfully",
    });
  }
  else {
    return res.json({
      success: false,
      message: "Error occured" + error,
    });
  }
}

//forgotpassword
exports.forgotpassword = async (req, res, next) => {

  let { phone, email } = req.body;
  let getUserInfo = await Users.findOne({
    $or: [{ phone: phone, phone_verified: true }, { email: email, email_verified: true }]
  }).exec();
  if (getUserInfo) {
    let otp = Math.floor(1000 + Math.random() * 9000);
    let otpExpirationTime = moment().add(10, "m");
    const payload = {
      user: {
        id: getUserInfo._id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, {
      expiresIn: "10m",
    });

    const data = await Users.findOneAndUpdate(
      { _id: getUserInfo._id },
      {
        $set: {
          otp: otp,
          otpExpirationTime: otpExpirationTime.toISOString(),
          passwordResetToken: token
        }
      },
      { new: true }
    );
    if (data) {
      if (req.body.phone) {
        Twillio.sendOtp(otp, data.country_code + data.phone);
        sleep(1000).then(function () {
          return res.json({
            success: true,
            message: data.passwordResetToken
          });
        });
      }
      else if (req.body.email) {
        SendEmailVerificationLink(otp, req, email);
        sleep(1000).then(function () {
          return res.json({
            success: true,
            message: data.passwordResetToken
          });
        });
      }
    } else {
      return res.json({
        success: false,
        message: "user not found",
      });
    }
  } else {
    return res.json({
      success: false,
      message: "You are not registered with us!",
    });
  }
};

exports.resetPasswordVerifyOtp = async (req, res, next) => {
  try {
    var { token, otp } = req.body;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
    let user_id = verifytoken.user.id;

    if (verifytoken) {
      const userdetails = await Users.findOne({ _id: user_id });
      if (otp == userdetails.otp) {
        const updatedetails = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: {
              otp: "",
              otpExpirationTime: ""
            }
          },
          { new: true }
        );
        if (updatedetails) {
          return res.json({
            success: true,
            message: token
            // message: "OTP verified successfully",
          });
        } else {
          res.json({
            success: false,
            message: "Error occured" + error,
          });
        }
      } else {
        res.json({
          success: false,
          message: "Incorrect OTP",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "token expired",
      });
    }
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.json({
        success: false,
        message: "Session expired, resend OTP",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured" + error,
      });
    }
  }
};

exports.resetpassword = async (req, res, next) => {
  try {
    let { token, password, confirmPassword } = req.body;
    const verifytoken = jwt.verify(token, process.env.JWT_KEY);
    let user_id = verifytoken.user.id;
    if (verifytoken) {
      if (password == confirmPassword) {
        const passwordUpdate = await Users.findByIdAndUpdate(
          { _id: user_id },
          {
            $set: {
              password: bcrypt.hashSync(password, 12),
              passwordResetToken: ""
            }
          },
          { new: true }
        );
        if (passwordUpdate) {
          return res.json({
            success: true,
            message: "Password changed successfully",
          });
        } else {
          return res.json({
            success: false,
            message: "Error occured" + error,
          });
        }
      } else {
        return res.json({
          success: false,
          message: "password must be the same",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "token expired",
      });
    }
  } catch (error) {
    if (error.name == "TokenExpiredError") {
      return res.json({
        success: false,
        message: "Session expired, resend OTP",
      });
    } else {
      return res.json({
        success: false,
        message: "Error occured" + error,
      });
    }
  }
};

//updateGcmtoken
exports.gcm_token_updation = async (req, res, next) => {
  const { token, user_id } = req.body;
  const verifyToken = await verifyGCMToken(token);
  console.log(verifyToken);

  const updateGcmtoken = await Users.findByIdAndUpdate(
    { _id: user_id },
    {
      $set: {
        gcm_token: token,
      },
    },
    { new: true }
  );
  if (updateGcmtoken) {
    return res.json({
      success: true,
      message: "gcm_token updated",
    });
  } else {
    return res.json({
      success: false,
      message: "Error",
    });
  }
};

// search user
exports.search_user = async (req, res, next) => {
  const search_userName = req.query.search_user;
  const user_id = req.user_id;
  // blocked User
  // let getBlockedUsers = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();

  const get_data = await Users.find({ isActive: true }).exec();

  const all_users = get_data.filter(data => new RegExp(search_userName, "ig").test(data.username)).sort((a, b) => {
    let re = new RegExp("^" + search_userName, "i")
    return re.test(a.username) ? re.test(b.username) ? a.username.localeCompare(b.username) : -1 : 1
  })

  if (all_users.length > 0) {
    const data_follower = await followSchema.distinct("followingId", {
      followerId: user_id,
      status: 1
    });
    const data_following = await followSchema.distinct("followerId", {
      followingId: user_id,
      status: 1
    });
    var array3 = data_follower.concat(data_following).map(String);
    var uniq_id = [...new Set(array3)];
    console.log(uniq_id);
    all_users.forEach((data) => {
      uniq_id.forEach((main_data) => {
        if (main_data == data._id) {
          data["follow"] = 1;
        }
      });
    });
    return res.json({
      success: true,
      result: all_users
    });
  } else {
    return res.json({
      success: false,
      message: "user not found ",
    });
  }
};

//search_place
exports.search_place = async (req, res, next) => {

  const search = req.query.place;
  if (!search) {
    let get_place = [];
    return res.json({
      success: true,
      Place: get_place,
      message: "No Places Found"
    });
  }
  else {
    const get_data = await postSchema.find({ isActive: true }).exec();

    const get_place = get_data.filter(data => new RegExp(search, "ig").test(data.place)).sort((a, b) => {
      let re = new RegExp("^" + search, "i")
      return re.test(a.place) ? re.test(b.place) ? a.place.localeCompare(b.place) : -1 : 1
    });
    if (get_place.length > 0) {
      return res.json({
        success: true,
        Place: get_place
      });
    }
    else {
      return res.json({
        success: true,
        Place: get_place,
        message: "No Places Found"
      });
    }
  }
}

// getPostBySearchPlace
exports.getPostBySearchPlace = async (req, res, next) => {

  const place = req.query.place;
  const user_id = req.user_id;
  // blocked User
  let getBlockedUsers1 = await blocked.distinct("Blocked_user", { Blocked_by: user_id }).exec();
  let getBlockedUsers2 = await blocked.distinct("Blocked_by", { Blocked_user: user_id }).exec();
  let totalBlockedUser = getBlockedUsers1.concat(getBlockedUsers2);
  const data_follower = await followSchema.distinct("followingId", { followerId: user_id, status: 1 }).exec();
  let blockedAndFollower = totalBlockedUser.concat(data_follower);
  //get_placeWithFollowers
  const get_placeWithFollowers = await postSchema.find({
    user_id: { $in: data_follower, $nin: totalBlockedUser },
    place: place,
    privacyType: { $nin: "onlyMe" },
    isActive: true,
    isDeleted: false
  }).populate("user_id", "username name avatar private follow").exec();
  //get_placeWithoutFollowers  
  const get_placeWithoutFollowers = await postSchema.find({
    user_id: { $nin: blockedAndFollower },
    place: place,
    privacyType: { $nin: ["private", "onlyMe"] },
    isActive: true,
    isDeleted: false
  }).populate("user_id", "username name avatar private follow").exec();
  //get_place
  let get_place = get_placeWithFollowers.concat(get_placeWithoutFollowers);
  if (get_place.length > 0) {
    var array3 = data_follower.map(String);
    var uniq_id = [...new Set(array3)];
    console.log(uniq_id);
    get_place.forEach((postdata) => {
      uniq_id.forEach((following_id) => {
        if (following_id == postdata.user_id._id) {
          postdata.user_id.follow = 1;
        }
      });
    });

    let get_like = await likeSchema.distinct("post_id", {
      user_id: user_id,
      isLike: 1,
    });
    let likedIds = get_like.map(String);
    get_place.forEach((post) => {
      likedIds.forEach((id) => {
        if (id == post._id) {
          post.isLiked = 1;
        }
      });
    });
    return res.json({
      success: true,
      feeds: get_place,
    });
  }
  else {
    return res.json({
      success: false,
      feeds: get_place,
      message: "No data found"
    });
  }
};

// upload avatar in user schema
exports.upload_avatar = async (req, res, next) => {
  const file = req.files.photo;
  const user_id = req.user_id;
  console.log(file.originalname);
  console.log(file);
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    file.mv("./profile_avatar/" + file.name, async function (err, result) {
      if (err) throw err;
      const getUserInfoAndUpdate = await Users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: { avatar: file.name },
        },
        { new: true }
      );
      if (getUserInfoAndUpdate) {
        res.send({
          success: true,
          message: file.name
        });
      }
    });
  } else {
    return res.json({
      success: false,
      message: "Only jpeg and png are accepted "
    });
  }
};

// update avatar in user schema

exports.change_avatar = async (req, res, next) => {
  const file = req.files.photo;
  const user_id = req.user_id;
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    file.mv("./profile_avatar/" + file.name, async function (err, result) {
      if (err) throw err;
      const getUserInfoAndUpdate = await Users.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: { avatar: file.name },
        },
        { new: true }
      );
      if (getUserInfoAndUpdate) {
        res.send({
          success: true,
          message: file.name
        });
      }

    });
  } else {
    return res.json({
      success: false,
      message: "Only jpeg and png are accepted"
    });
  }
};

exports.search = async (req, res, next) => {
  const user_id = req.user_id;
  const search_user = req.query.search_user;
  const search_hashtag = req.query.search_hashtag;
  const search_category = req.query.search_category;
  if (search_user) {
    // let reg = new RegExp(search_user);
    const get_data = await Users.find({ isActive: true }).exec();

    const all_users = get_data.filter(data => new RegExp(search_user, "ig").test(data.username)).sort((a, b) => {
      let re = new RegExp("^" + search_user, "i")
      return re.test(a.username) ? re.test(b.username) ? a.username.localeCompare(b.username) : -1 : 1
    });
    if (all_users.length > 0) {
      const data_follower = await followSchema.distinct("followingId", {
        followerId: user_id,
        status: 1
      }).exec();
      var array1 = data_follower.map(String);
      var followed = [...new Set(array1)];
      const followRequest = await followSchema.distinct("followingId", {
        followerId: user_id,
        status: 0
      }).exec();
      var array2 = followRequest.map(String);
      var requested = [...new Set(array2)];
      //follow1
      all_users.forEach((data) => {
        followed.forEach((main_data) => {
          if (main_data == data._id) {
            data.follow = 1;
          }
        });
      });
      //follow2
      all_users.forEach((data) => {
        requested.forEach((main_data) => {
          if (main_data == data._id) {
            data.follow = 2;
          }
        });
      });
      sleep(2000).then(function () {
        return res.json({
          success: true,
          result: all_users
        });
      });
    } else {
      return res.json({
        success: false,
        message: "user not found ",
      });
    }
  } else if (search_hashtag) {
    // let reg = new RegExp(search_hashtag);
    const getHashtags = await Hashtag.find({ "hashtag": new RegExp(".*" + req.query.search_hashtag + ".*", "i"), "isDeleted": false }).exec();
    if (getHashtags.length > 0) {
      let userFollowedHashtagList = await Users.distinct(
        "followedHashtag._id",
        { _id: user_id }
      ).exec();
      userFollowedHashtagList = userFollowedHashtagList.map(String);
      var followedHashtagId = [...new Set(userFollowedHashtagList)];
      getHashtags.forEach((data) => {
        followedHashtagId.forEach((hashId) => {
          console.log(hashId == data._id);
          if (hashId == data._id) {
            data.follow = 1;
          }
        });
      });

      getHashtags.forEach(async (data) => {
        console.log(data);
        const postCount = await postSchema.find({ hashtag: data.hashtag }).exec();
        data.posts = postCount.length;
      })
      return res.json({
        success: true,
        result: getHashtags
      });
    } else {
      return res.json({
        success: false,
        message: "hashtag not found ",
      });
    }
  }
  else if (search_category) {
    const getPosts = await postSchema.find({ "category": new RegExp(".*" + req.query.search_category + ".*", "i"), isActive: true }).exec();
    if (getPosts.length > 0) {
      const data_follower = await followSchema.distinct("followingId", {
        followerId: user_id,
        status: 1
      });
      // const data_following = await followSchema.distinct("followerId", {
      //   followingId: user_id,
      // });
      var array3 = data_follower.map(String);
      var uniq_id = [...new Set(array3)];
      console.log(uniq_id);
      getPosts.forEach((data) => {
        uniq_id.forEach((main_data) => {
          if (main_data == data.user_id) {
            data.follow = 1;
          }
        });
      });
      return res.json({
        success: true,
        result: getPosts
      });
    }
    else {
      return res.json({
        success: false,
        message: "No data found"
      });
    }
  }
};

//contactSync
exports.contactSync = async (req, res, next) => {
  const user_id = req.user_id;
  console.log(req.body);
  let phonelist = [];
  phonelist = req.body.phone;
  const userlist = await Users.find({ phone: { $in: phonelist } }, { _id: 1, username: 1, name: 1, follow: 1, private: 1, phone: 1, avatar: 1 }).exec();
  if (userlist.length > 0) {
    //data_follower
    const data_follower = await followSchema.distinct("followingId", {
      followerId: user_id,
      status: 1
    });
    var array1 = data_follower.map(String);
    var followed = [...new Set(array1)];
    //data_request
    const data_request = await followSchema.distinct("followingId", {
      followerId: user_id,
      status: 0
    });
    var array2 = data_request.map(String);
    var requested = [...new Set(array2)];
    //follow1
    userlist.forEach((data) => {
      followed.forEach((main_data) => {
        if (main_data == data._id) {
          data.follow = 1;
        }
      });
    });
    //follow2
    userlist.forEach((data) => {
      requested.forEach((main_data) => {
        if (main_data == data._id) {
          data.follow = 2;
        }
      });
    });
    sleep(2000).then(function () {
      return res.json({
        success: true,
        users: userlist
      });
    });
  }
  else {
    return res.json({
      success: false,
      message: "No data found"

    })
  }
}

//getUserDetails
exports.getUserDetails = async (req, res, next) => {

  let user_id = req.user_id;
  const getUserData = await Users.findOne({ _id: user_id }).exec();
  if (getUserData) {
    return res.json({
      success: true,
      result: getUserData
    });
  }
}
