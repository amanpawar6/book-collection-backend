const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/mongoConnection');
const bookRoutes = require('./routes/v1/routes');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerUi, swaggerSpec } = require('./swagger');
// const rateLimiter = require('./middlewares/rateLimiter');
const env = require('./config/env');

connectDB();

const app = express();

// app.use(rateLimiter);

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/v1/api/', bookRoutes);

app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the app for testing
module.exports = app;