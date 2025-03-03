# Personal Book Collection App

## Overview
The **Personal Book Collection App** is a web application that allows users to manage their personal book collection. Users can:
- Add books with details like title, author, genre, and status (read/unread).
- View books by genre.
- Mark books as read or unread.
- Search books by title.
- Register and log in to manage their own collection.
- View paginated lists of books.

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT** (for authentication)
- **bcrypt** (for password hashing)

## Features
- User Signup/Login with JWT Authentication
- Book Addition with Title, Author, Genre, and Status
- Search Books by Title
- Genre-based Book Listing
- Mark Books as Read or Unread
- Paginated Book Lists
- Logout Functionality

## Folder Structure
├─ backend/                  # Backend API (Node.js + Express.js + MongoDB)
│   ├─ models/               # Mongoose Models
│   ├─ routes/               # Express Routes
│   ├─ controllers/          # Route Controllers
│   ├─ middleware/           # Authentication Middleware
│   └─ server.js             # Main Server File


## Installation
### Prerequisites
- Node.js (v14 or later)
- MongoDB

### Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following environment variables:
   ```env
   MONGO_URI=mongodb://localhost:27017/book_collection
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Default Login Credentials
| email | Password |
|----------|----------|
| aman@test.com | Admin@123 |

## API Endpoints
| Method | Endpoint       | Description       |
|--------|---------------|-----------------|
| POST   | `/v1/signup`   | User Signup     |
| POST   | `/v1/login`    | User Login      |
| POST   | `/v1/addBook`  | Add a New Book  |
| GET    | `/v1/books`    | Get All Books   |
| GET    | `/v1/books/:genre` | Get Books by Genre |
| PUT    | `/v1/books/:id/read` | Mark Book as Read |
| PUT    | `/v1/books/:id/unread` | Mark Book as Unread |

## Demo
To run the app locally:
1. Start the backend server.
2. Start the frontend app.
3. Open your browser at `http://localhost:3000`.

## Future Improvements
- Email Notifications
- Book Rating System
- Dark Mode Theme

## Author
- Developer: **Aman Pawar**
- GitHub: [Your GitHub Profile]

## License
This project is licensed under the MIT License.
