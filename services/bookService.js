const Book = require('../models/Book');
const UserBookReadStatus = require('../models/UserBookReadStatus');
const sendResponse = require('../utils/response');
const { saveBookSchema, getBookSchema, getBooksByGenreSchema, userBookStatusToggleSchema, userBookStatusSchema, getBookDetailsSchema } = require('../schema/exportSchema');
const { RESPONSE_CODE, RESPONSE_MESSAGE } = require("../utils/constants");
const s3Upload = require('../utils/s3Upload');
const { isValidObjectId } = require('../utils/customFunction');

const addBook = async (req, res) => {
    try {
        const { title, author, genre, publicationYear } = req?.body;
        const file = req.file;

        const validate = saveBookSchema.validate({ title, author, genre, publicationYear });

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        // Upload the file to S3
        const s3Response = await s3Upload(file);

        // Create a new book with the S3 image URL
        const book = new Book({
            title,
            author,
            genre,
            publicationYear,
            coverImage: s3Response.Location, // S3 file URL
        });

        await book.save();

        return sendResponse(res, RESPONSE_CODE?.CREATED, book, RESPONSE_MESSAGE?.DATA_ADDED);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const getBooks = async (req, res) => {
    try {

        const validate = getBookSchema.validate(req?.query);

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const { page = 1, limit = 10, query } = req?.query;

        const searchQuery = query ? {
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { genre: { $regex: query, $options: 'i' } }
            ]
        } : {};

        const books = await Book.aggregate([
            {
                $match: searchQuery
            },
            {
                $lookup: {
                    from: "userbookreadstatuses",
                    localField: "_id",
                    foreignField: "bookId",
                    as: "result"
                }
            },
            {
                $unwind: {
                    path: "$result",
                    // includeArrayIndex: 'string',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: "$_id",
                    author: "$author",
                    title: "$title",
                    genre: "$genre",
                    publicationYear: "$publicationYear",
                    coverImage: "$coverImage",
                    isDeleted: "$isDeleted",
                    result: "$result",
                    read: {
                        $cond: {
                            if: {
                                $eq: ["$result.isDeleted", true]
                            },
                            then: false,
                            else: {
                                $cond: {
                                    if: {
                                        $eq: ["$result.isDeleted", false]
                                    },
                                    then: true,
                                    else: false // Default value if isDeleted is not present or null
                                }
                            }
                        }
                    }
                }
            },
            {
                $limit: limit * page
            },
            {
                $skip: (page - 1) * limit
            }
        ]);

        const count = await Book.countDocuments(searchQuery);

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, { data: books, totalPages: Math.ceil(count / limit), currentPage: page }, RESPONSE_MESSAGE?.DATA_FETCHED);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const getGenres = async (req, res) => {
    try {
        const [result] = await Book.aggregate(
            [
                {
                    $group:
                    {
                        _id: "genre",
                        genre: {
                            $addToSet: "$genre"
                        }
                    }
                }
            ]
        );

        let response = [];

        if (result) {
            response = result?.genre
        }

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, response, RESPONSE_MESSAGE?.DATA_FETCHED);

    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getBooksByGenres = async (req, res) => {
    try {
        // Validate the genre parameter
        const validate = getBooksByGenreSchema.validate(req?.params);
        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const { genre } = req?.params;
        const { page = 1, limit = 10 } = req?.query; // Default page = 1, limit = 10

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch books by genre with pagination
        const books = await Book.find({ genre: { $regex: genre, $options: 'i' } })
            .skip(skip)
            .limit(parseInt(limit));

        // Count total books matching the genre
        const totalBooks = await Book.countDocuments({ genre: { $regex: genre, $options: 'i' } });

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, {
            data: books,
            totalBooks,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBooks / limit),
        }, RESPONSE_MESSAGE?.DATA_FETCHED);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

const userBookStatusToggle = async (req, res) => {
    try {

        const validate = userBookStatusToggleSchema.validate(req?.body);

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const { customerId, bookId } = req.body;

        // Check if the entry exists
        const existingStatus = await UserBookReadStatus.findOne({ customerId, bookId });

        let result;

        if (existingStatus) {
            // Toggle isDeleted
            existingStatus.isDeleted = !existingStatus.isDeleted;
            result = await existingStatus.save();
        } else {
            // Create a new entry
            result = await UserBookReadStatus.create({ customerId, bookId });
        }

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, result, RESPONSE_MESSAGE?.STATUS_UPDATED);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const userBookStatusRead = async (req, res) => {
    try {

        const validate = userBookStatusSchema.validate(req?.query);

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const { customerId, page = 1, limit = 10 } = req?.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const readBooks = await UserBookReadStatus.find({ customerId, isDeleted: false })
            .populate('bookId')
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await UserBookReadStatus.countDocuments({ customerId, isDeleted: false });
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const books = readBooks.map((status) => {
            let book = status?.bookId;
            return {
                author: book?.author,
                genre: book?.genre,
                isDeleted: book?.isDeleted,
                publicationYear: book?.publicationYear,
                coverImage: book?.coverImage,
                title: book?.title,
                _id: book?._id,
                read: true
            };
        });

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, {
            data: books,
            totalItems: totalCount,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        }, RESPONSE_MESSAGE?.DATA_FETCHED);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const userBookStatusUnread = async (req, res) => {
    try {

        const validate = userBookStatusSchema.validate(req?.query);

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const { customerId, page = 1, limit = 10 } = req?.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const readBooks = await UserBookReadStatus.find({ customerId, isDeleted: true })
            .populate('bookId')
            .skip(skip)
            .limit(parseInt(limit));

        const totalCount = await UserBookReadStatus.countDocuments({ customerId, isDeleted: true });
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        const books = readBooks.map((status) => {
            let book = status?.bookId;
            return {
                author: book?.author,
                genre: book?.genre,
                isDeleted: book?.isDeleted,
                publicationYear: book?.publicationYear,
                coverImage: book?.coverImage,
                title: book?.title,
                _id: book?._id,
                read: false
            };
        });

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, {
            data: books,
            totalItems: totalCount,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        }, RESPONSE_MESSAGE?.DATA_FETCHED);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const getBookDetails = async (req, res) => {
    try {

        const validate = getBookDetailsSchema.validate(req?.params);

        if (validate?.error) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        if (!isValidObjectId(req?.params?.id)) {
            return sendResponse(res, RESPONSE_CODE?.UNPROCESSABLE_CONTENT, null, validate?.error?.details[0]?.message ?? RESPONSE_MESSAGE?.REQUEST_BODY_ERROR);
        }

        const book = await Book.findById(req.params.id);

        if (!book) return sendResponse(res, 404, null, 'Book not found');

        return sendResponse(res, RESPONSE_CODE?.SUCCESS, { data: book }, RESPONSE_MESSAGE?.DATA_FETCHED);

    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    addBook,
    getBooks,
    getGenres,
    getBooksByGenres,
    userBookStatusToggle,
    userBookStatusRead,
    userBookStatusUnread,
    getBookDetails
};