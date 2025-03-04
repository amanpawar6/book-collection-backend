const Joi = require('joi');

const getBooksByGenreSchema = Joi.object({
    genre: Joi.string().required().messages({
        'string.empty': 'Genre is required',
    }),
});

module.exports = { getBooksByGenreSchema };