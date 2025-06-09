const express = require('express');
const dotenv = require('dotenv');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars



// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 