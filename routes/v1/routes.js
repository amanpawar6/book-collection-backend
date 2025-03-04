const express = require('express');
const { addBook, getBooks, getGenres, getBooksByGenres, userBookStatusToggle, userBookStatusRead, userBookStatusUnread, getBookDetails } = require('../../services/bookService');
const { loginHandler, signupHandler } = require('../../services/userService');
const upload = require("../../utils/multer");
const { jwtValidate } = require('../../middlewares/jwt');

const router = express.Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 *       422:
 *         description: Validation error
 */
router.post('/login', loginHandler);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 *       422:
 *         description: Validation error
 */
router.post('/signup', signupHandler);

/**
 * @swagger
 * /get-books:
 *   get:
 *     summary: Get all books
 *     description: Retrieve a list of all books with optional pagination and search.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query (title, author, or genre)
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/get-books", getBooks);

/**
 * @swagger
 * /get-genres:
 *   get:
 *     summary: Get all genres
 *     description: Retrieve a list of all available genres.
 *     responses:
 *       200:
 *         description: Genres fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/get-genres', getGenres);

/**
 * @swagger
 * /get-books-by-genre/{genre}:
 *   get:
 *     summary: Get books by genre
 *     description: Retrieve a paginated list of books filtered by genre.
 *     parameters:
 *       - in: path
 *         name: genre
 *         schema:
 *           type: string
 *         required: true
 *         description: Genre to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 totalBooks:
 *                   type: integer
 *                   description: Total number of books matching the genre
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *       500:
 *         description: Internal server error
 */
router.get('/get-books-by-genre/:genre', getBooksByGenres);

/**
 * @swagger
 * /get-book-details/{id}:
 *   get:
 *     summary: Get book details
 *     description: Retrieve details of a specific book by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details fetched successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get("/get-book-details/:id", getBookDetails);

router.use(jwtValidate);

/**
 * @swagger
 * /add-book:
 *   post:
 *     summary: Add a new book
 *     description: Add a new book to the database.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book added successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/add-book', upload.single('coverImage'), addBook);

/**
 * @swagger
 * /user-book-status/toggle:
 *   post:
 *     summary: Toggle book read status
 *     description: Toggle the read status of a book for a user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book status toggled successfully
 *       500:
 *         description: Internal server error
 */
router.post('/user-book-status/toggle', userBookStatusToggle);

/**
 * @swagger
 * /user-book-status/read:
 *   get:
 *     summary: Get read books
 *     description: Retrieve a list of books marked as read by a user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Customer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/user-book-status/read', userBookStatusRead);

/**
 * @swagger
 * /user-book-status/unread:
 *   get:
 *     summary: Get unread books
 *     description: Retrieve a list of books marked as unread by a user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *         description: Customer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Books fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get('/user-book-status/unread', userBookStatusUnread);

module.exports = router;