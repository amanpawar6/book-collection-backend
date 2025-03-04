const request = require('supertest');
const app = require('../app');
const Book = require('../models/Book');
const User = require('../models/Users');
const UserBookReadStatus = require('../models/UserBookReadStatus');
const bcrypt = require('bcryptjs');

jest.setTimeout(10000); // Increase timeout to 10 seconds

describe('API Tests', () => {
    let token;
    let bookId;
    let userId;

    beforeAll(async () => {

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create a test user
        const user = new User({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            userName: 'testuser',
            password: hashedPassword,
        });
        await user.save();
        userId = user._id.toString();

        // Login to get a token
        const loginResponse = await request(app)
            .post('/v1/api/login')
            .send({ email: 'test@example.com', password: 'password123' });
        token = loginResponse?.body?.data?.token;

        // Add a test book
        const book = new Book({
            title: 'Test Book',
            author: 'Test Author',
            genre: 'Test Genre',
            publicationYear: 2023,
        });
        await book.save();
        bookId = book._id;
    });

    describe('POST /login', () => {
        it('should login a user and return a token', async () => {
            const response = await request(app)
                .post('/v1/api/login')
                .send({ email: 'test@example.com', password: 'password123' });
            // console.log(response);
            expect(response.statusCode).toBe(200);
            expect(response.body.data.token).toBeDefined();
        });

        it('should return 404 for invalid credentials', async () => {
            const response = await request(app)
                .post('/v1/api/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });
            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Invalid email or Password');
        });
    });

    describe('POST /signup', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/v1/api/signup')
                .send({
                    firstName: 'New',
                    lastName: 'User',
                    email: 'newuser@example.com',
                    userName: 'newuser',
                    password: 'password123',
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('User Created Successfully');
        });

        it('should return 400 for duplicate email', async () => {
            const response = await request(app)
                .post('/v1/api/signup')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    userName: 'testuser2',
                    password: 'password123',
                });
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Email already exists');
        });
    });

    describe('GET /get-books', () => {
        it('should fetch all books', async () => {
            const response = await request(app).get('/v1/api/get-books');
            expect(response.statusCode).toBe(200);
            expect(response.body.data.data).toBeInstanceOf(Array);
        });
    });

    describe('POST /add-book', () => {
        it('should add a new book', async () => {
            const response = await request(app)
                .post('/v1/api/add-book')
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Test Book')
                .field('author', 'Test Author')
                .field('genre', 'Test Genre')
                .field('publicationYear', 2023)
                .attach('coverImage', 'tests/No_Cover.jpg');
            expect(response.statusCode).toBe(201);
            expect(response.body.data.title).toBe('Test Book');
        });

        it('should return 422 for invalid data', async () => {
            const response = await request(app)
                .post('/v1/api/add-book')
                .set('Authorization', `Bearer ${token}`)
                .field('title', '')
                .field('author', 'Test Author')
                .field('genre', 'Test Genre')
                .field('publicationYear', 2023);
            expect(response.statusCode).toBe(422);
        });
    });

    describe('GET /get-book-details/:id', () => {
        it('should fetch book details', async () => {
            const response = await request(app).get(`/v1/api/get-book-details/${bookId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body.data.data.title).toBe('Test Book');
        });

        it('should return 422 for invalid book ID', async () => {
            const response = await request(app).get('/v1/api/get-book-details/invalidid');
            expect(response.statusCode).toBe(422);
        });
    }); 

    describe('POST /user-book-status/toggle', () => {
        it('should toggle book read status', async () => {
            const response = await request(app)
                .post('/v1/api/user-book-status/toggle')
                .set('Authorization', `Bearer ${token}`)
                .send({ customerId: userId, bookId });
            expect(response.statusCode).toBe(200);
            expect(response.body.data.isDeleted).toBeDefined();
        });
    });

    describe('GET /user-book-status/read', () => {
        it('should fetch read books', async () => {
            const response = await request(app)
                .get('/v1/api/user-book-status/read')
                .set('Authorization', `Bearer ${token}`)
                .query({ customerId: userId });
            // console.log(response);
            expect(response.statusCode).toBe(200);
            expect(response.body.data.data).toBeInstanceOf(Array);
        });
    });

    describe('GET /user-book-status/unread', () => {
        it('should fetch unread books', async () => {
            const response = await request(app)
                .get('/v1/api/user-book-status/unread')
                .set('Authorization', `Bearer ${token}`)
                .query({ customerId: userId });
            expect(response.statusCode).toBe(200);
            expect(response.body.data.data).toBeInstanceOf(Array);
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Book.deleteMany({});
        await UserBookReadStatus.deleteMany({});
    });
});