const mongoose = require("mongoose");
const { db_Main } = require("../../db/database")

const verifiedPhoneEmail = new mongoose.Schema({

    verifiedPhone : [],
    verifiedEmail : []
  
});

module.exports = db_Main.model("verifiedPhoneEmails", verifiedPhoneEmail);
