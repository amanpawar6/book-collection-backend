const mongoose = require('mongoose');

const UserBookReadStatusSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    isDeleted: { type: Boolean, default: false }, // To soft-delete entries
});

module.exports = mongoose.model('UserBookReadStatus', UserBookReadStatusSchema);