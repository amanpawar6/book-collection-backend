const Joi = require('joi');

const getBooksByGenreSchema = Joi.object({
    genre: Joi.string().required().messages({
        'string.empty': 'Genre is required',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.min': 'Limit must be at least 1',
    }),
});

module.exports = { getBooksByGenreSchema };