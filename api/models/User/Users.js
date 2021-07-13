const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const user_schema = new mongoose.Schema({

  username: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  isemail: {
    type: Boolean,
    default: true
  },
  email: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },
  country_code: {
    type: String,
    default: "",
  },
  isphone: {
    type: Boolean,
    default: true
  },
  phone: {
    type: String,
    default: "",
  },
  DOB: {
    type: String,
    default: ""
  },
  gender: {
    type: String
  },
  otp: {
    type: String,
    default: "",
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  phone_verified: {
    type: Boolean,
    default: false
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  otpExpirationTime: {
    type: String
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  gcm_token: {
    type: String,
  },
  avatar: {
    type: String,
    default: ""
  },
  created_At: {
    type: Date,
  },
  updated_At: {
    type: Date,
    default: "",
  },
  facebook_signin: {
    type: Boolean,
    default: false,
  },
  google_signin: {
    type: Boolean,
    default: false,
  },
  follow: {
    type: Number,
    default: 0,
  },
  followedHashtag: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId,ref: "hashtags" },
      hashtag: { type: String },
    },
  ],
  bio: {
    type: String,
    maxlength : 200,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  profession: {
    type: String,
    default: "",
  },
  CurrentLocation:{
      type:String,
      default: "",
  },
  Location:{
      type:String,
      default: "",
  },
  Website:{
    type:String,
    default: "",
  },
  MaritalStatus:{
    type:String,
    default: ""
  },
  isQualification: {
    type : Boolean,
    default : true
  },
  Qualification: [{
    Degree:{type:String},
    InstituteName:{type:String},
    YearofPassedOut:{type:String}
  }],
  isWorkExperience: {
    type : Boolean,
    default : true
  },
  WorkExperience:[{
    Designation:{type:String},
    OrganizationName:{type:String},
    From:{type:Date},
    To:{type:Date}
  }],
  private : {
    type: Boolean,
    default: false
  }

});
const user = db_Main.model("users", user_schema);
module.exports = user;
