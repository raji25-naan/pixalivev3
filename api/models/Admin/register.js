const mongoose = require("mongoose");

const { db_Main } = require("../../db/database")

const register = new mongoose.Schema({

    username: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    country_code: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    created_At: {
        type: Date
    },
    updated_At: {
        type: Date,
        default: ''
    }
});

module.exports = db_Main.model("admin_schema", register)