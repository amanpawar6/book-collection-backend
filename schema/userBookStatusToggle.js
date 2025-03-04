const Joi = require('joi');

const userBookStatusToggleSchema = Joi.object({
    customerId: Joi.string().required().messages({
        'string.empty': 'Customer ID is required',
    }),
    bookId: Joi.string().required().messages({
        'string.empty': 'Book ID is required',
    }),
});

module.exports = { userBookStatusToggleSchema };