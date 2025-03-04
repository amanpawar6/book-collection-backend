const Joi = require('joi');

const getBookDetailsSchema = Joi.object({
    id: Joi.string().required().messages({
        'string.empty': 'Book ID is required',
    }),
});

module.exports = { getBookDetailsSchema };