const { getBookDetailsSchema } = require('./getBookDetails');
const { getBooksByGenreSchema } = require('./getBooksByGenre');
const { loginSchema } = require('./loginSchema');
const { saveBookSchema } = require('./saveBook');
const { signupSchema } = require('./signupSchema');
const { userBookStatusToggleSchema } = require('./userBookStatusToggle');
const { userBookStatusSchema } = require('./userBookStatus');
const { getBookSchema } = require('./getBookSchema');


module.exports = {
    getBookDetailsSchema,
    getBooksByGenreSchema,
    loginSchema,
    saveBookSchema,
    signupSchema,
    userBookStatusToggleSchema,
    userBookStatusSchema,
    getBookSchema
};