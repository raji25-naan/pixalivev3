const { check, validationResult, query, param } = require("express-validator");
const { ErrorMessage } = require("../helpers/ErrorMessage");

const validateRequest = (req,res,next) => {

    const errors = validationResult(req);
    if(errors.isEmpty())
    {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push(err.msg))

    return res.json({
        success: false,
        message: extractedErrors[0],
    })
};

const checkRequestBodyParams = (val) => {
    return check(val, ErrorMessage.general.required).isLength({ min: 1 })
        .trim()
        .exists().withMessage(ErrorMessage.general.required)
}

const checkQuery = (id) => {
    return query(id, ErrorMessage.id.required).isLength({ min: 1 })
        .trim()
        .exists()
}
const checkParam = (id) => {
    return param(id, ErrorMessage.id.required)
        .trim()
        .exists()
}

module.exports = {validateRequest,checkRequestBodyParams,checkQuery,checkParam}