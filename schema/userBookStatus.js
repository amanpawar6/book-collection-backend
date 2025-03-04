const Joi = require('joi');

const userBookStatusSchema = Joi.object({
    customerId: Joi.string().optional().messages({
        'string.base': 'Customer ID must be a string',
    }),
    page: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).optional().messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
    }),
});

module.exports = { userBookStatusSchema };