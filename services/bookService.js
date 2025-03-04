const Book = require('../models/Book');
const UserBookReadStatus = require('../models/UserBookReadStatus');
const sendResponse = require('../utils/response');
const { responseCode, messages } = require("../utils/constants");
const { saveBookSchema } = require('../schema/saveBook');
const { errorDetails } = require("../utils/customFunction");
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const addBook = async (req, res) => {
    try {
        const { title, author, genre, publicationYear } = req?.body;
        const file = req.file;

        const validate = saveBookSchema.validate({ title, author, genre, publicationYear });

        if (validate?.error) {
            // console.log(JSON.stringify(validate));
            let errorMessage = errorDetails(validate?.error?.details);
            // console.log(errorMessage);
            return sendResponse(res, 422, null, errorMessage);
        }

        // Upload the file to S3
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `covers/${Date.now()}_${file.originalname}`, // Unique file name
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read', // Make the file publicly accessible
        };

        const s3Response = await s3.upload(params).promise();

        // Create a new book with the S3 image URL
        const book = new Book({
            title,
            author,
            genre,
            publicationYear,
            coverImage: s3Response.Location, // S3 file URL
        });

        await book.save();

        return sendResponse(res, 201, book, 'Book added successfully');
    } catch (err) {
        console.log(err);
        return sendResponse(res, 400, null, err.message);
    }
};

const getBooks = async (req, res) => {
    const { page = 1, limit = 10, query } = req?.query;
    const searchQuery = query ? {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { author: { $regex: query, $options: 'i' } },
            { genre: { $regex: query, $options: 'i' } }
        ]
    } : {};

    try {
        // const books = await Book.find(searchQuery)
        //     .limit(limit * 1)
        //     .skip((page - 1) * limit)
        //     .exec();

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

        return sendResponse(res, responseCode?.SUCCESS, { data: books, totalPages: Math.ceil(count / limit), currentPage: page }, messages?.DATE_FETCHED);
    } catch (err) {
        // console.log(err);
        return sendResponse(res, 500, null, err.message);
    }
};

const deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req?.params?.id);
        sendResponse(res, 200, null, 'Book deleted successfully');
    } catch (err) {
        sendResponse(res, 500, null, err?.message);
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

        return sendResponse(res, 200, response, 'Genres fetched successfully.');

    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, null, error?.message);
    }
};

const getBooksByGenres = async (req, res) => {
    try {

        let { genre } = req.params;

        const result = await Book.find({ genre: { $regex: genre, $options: 'i' } })

        return sendResponse(res, 200, result?.length ? result : [], 'Genres fetched successfully.');

    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, null, error?.message);
    }
};

const userBookStatusToggle = async (req, res) => {
    const { customerId, bookId } = req.body;

    try {
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

        return sendResponse(res, 200, result, 'Book status toggled successfully');
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, null, error?.message ?? "Error toggling book status");
    }
}

const userBookStatusRead = async (req, res) => {
    const { customerId, page = 1, limit = 10 } = req.query;

    try {
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

        return sendResponse(res, 200, {
            data: books,
            totalItems: totalCount,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        }, 'Books fetched successfully');
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, null, error?.message ?? "Error fetching read books");
    }
}

const userBookStatusUnread = async (req, res) => {
    const { customerId, page = 1, limit = 10 } = req.query;

    try {
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

        return sendResponse(res, 200, {
            data: books,
            totalItems: totalCount,
            totalPages,
            currentPage: parseInt(page),
            pageSize: parseInt(limit)
        }, 'Books fetched successfully');
    } catch (error) {
        console.log(error);
        return sendResponse(res, 500, null, error?.message ?? "Error fetching read books");
    }
}

const getBookDetails = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) return sendResponse(res, 404, null, 'Book not found');

        return sendResponse(res, 200, { data: book }, 'Book details fetched successfully');

    } catch (error) {
        return sendResponse(res, 500, null, 'Failed to fetch book details');
    }
};

module.exports = { addBook, getBooks, deleteBook, getGenres, getBooksByGenres, userBookStatusToggle, userBookStatusRead, userBookStatusUnread, getBookDetails };