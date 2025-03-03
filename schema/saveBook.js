const Joi = require('joi');

const saveBookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    genre: Joi.string().required(),
    publicationYear: Joi.number().required()
});

module.exports = { saveBookSchema };