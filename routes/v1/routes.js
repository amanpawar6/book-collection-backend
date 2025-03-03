const express = require('express');
const { addBook, getBooks, deleteBook, getGenres, getBooksByGenres, userBookStatusToggle, userBookStatusRead, userBookStatusUnread, getBookDetails } = require('../../services/bookService');
const { loginHandler, signupHandler } = require('../../services/userService');
const upload = require("../../utils/multer");
const { jwtValidate } = require('../../middlewares/jwt');

const router = express.Router();

router.post('/login', loginHandler);

router.post('/signup', signupHandler);

router.get("/get-books", getBooks);

router.get('/get-genres', getGenres);

router.get('/get-books-by-genre/:genre', getBooksByGenres);

router.get("/get-book-details/:id", getBookDetails);

router.use(jwtValidate);

router.post('/add-book', upload.single('coverImage'), addBook);

router.post('/user-book-status/toggle', userBookStatusToggle);

router.get('/user-book-status/read', userBookStatusRead);

router.get('/user-book-status/unread', userBookStatusUnread);

// router.delete('/:id', deleteBook);

module.exports = router;