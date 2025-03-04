const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Connected');
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;