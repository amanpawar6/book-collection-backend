const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    publicationYear: { type: Number, required: true },
    coverImage: { type: String },
    // read: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', bookSchema);