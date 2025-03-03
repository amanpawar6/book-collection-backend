const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const connectDB = require('./config/mongoConnection');
const bookRoutes = require('./routes/v1/routes');

dotenv.config();
connectDB();

const app = express();

app.use(cors())

app.use(express.json());

app.use('/v1/api/', bookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));