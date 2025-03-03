const { errorDetails } = require("../utils/customFunction");
const sendResponse = require('../utils/response');
const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'your_jwt_secret';
const { loginSchema } = require('../schema/loginSchema');
const { signupSchema } = require('../schema/signupSchema');

const loginHandler = async (req, res) => {
    const { email, password } = req.body;

    try {

        const validate = loginSchema.validate({ email, password });

        if (validate?.error) {
            // console.log(JSON.stringify(validate));
            let errorMessage = errorDetails(validate?.error?.details);
            // console.log(errorMessage);
            return sendResponse(res, 422, null, errorMessage);
        }

        const user = await User.findOne({ email, isDeleted: false });
        if (!user) {
            return sendResponse(res, 400, null, 'Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendResponse(res, 400, null, 'Invalid email or password');
        }

        delete user?.password;

        const token = jwt.sign({ userId: user._id, userName: user.userName }, JWT_SECRET, { expiresIn: '1h' });
        return sendResponse(res, 200, { userDetails: user, token }, 'Login successful');
    } catch (err) {
        console.log(err);
        return sendResponse(res, 500, null, err?.message ?? 'Server error');
    }

}

const signupHandler = async (req, res) => {
    const { firstName, lastName, email, userName, password } = req.body;

    try {

        const validate = signupSchema.validate({ firstName, lastName, email, userName, password });

        if (validate?.error) {
            // console.log(JSON.stringify(validate));
            let errorMessage = errorDetails(validate?.error?.details);
            // console.log(errorMessage);
            return sendResponse(res, 422, null, errorMessage);
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
        return sendResponse(res, 201, null, 'User registered successfully');
    } catch (err) {
        console.log(err);
        return sendResponse(res, 500, null, err?.message ?? 'Server error');
    }
}

module.exports = {
    loginHandler,
    signupHandler
}