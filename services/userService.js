const sendResponse = require('../utils/response');
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const { signToken } = require('../middlewares/jwt');
const { loginSchema, signupSchema } = require('../schema/exportSchema');
const { RESPONSE_CODE, RESPONSE_MESSAGE } = require("../utils/constants");

const loginHandler = async (req, res) => {
    const { email, password } = req.body;

    try {

        const validate = loginSchema.validate({ email, password });

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            return sendResponse(res, RESPONSE_CODE?.NOT_FOUND, null, RESPONSE_MESSAGE?.INVALID_USER_PASSWORD);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendResponse(res, RESPONSE_CODE?.NOT_FOUND, null, RESPONSE_MESSAGE?.INVALID_USER_PASSWORD);
        }

        delete user?.password;

        const token = signToken(user?._id, user?.userName);

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, { userDetails: user, token }, RESPONSE_MESSAGE?.LOGIN_SUCCESS);
    } catch (err) {
        console.log(err);
        throw err;
    }

}

const signupHandler = async (req, res) => {
    const { firstName, lastName, email, userName, password } = req.body;

    try {

        const validate = signupSchema.validate({ firstName, lastName, email, userName, password });

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendResponse(res, 400, null, 'Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            userName,
            password: hashedPassword
        });

        await newUser.save();
        return sendResponse(res, RESPONSE_CODE?.CREATED, null, RESPONSE_MESSAGE?.USER_CREATED);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = {
    loginHandler,
    signupHandler
}