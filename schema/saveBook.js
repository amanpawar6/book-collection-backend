const Joi = require('joi');

const saveBookSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required',
    }),
    author: Joi.string().required().messages({
        'string.empty': 'Author is required',
    }),
    genre: Joi.string().required().messages({
        'string.empty': 'Genre is required',
    }),
    publicationYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
        'number.base': 'Publication year must be a number',
        'number.min': 'Publication year must be at least 1000',
        'number.max': `Publication year cannot be greater than ${new Date().getFullYear()}`,
        'number.empty': 'Publication year is required',
    }),
});

module.exports = { saveBookSchema };