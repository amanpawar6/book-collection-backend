const Joi = require('joi');

const signupSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required',
    }),
    lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required',
    }),
    userName: Joi.string().required().messages({
        'string.empty': 'Username is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
    }),
});

module.exports = { signupSchema };