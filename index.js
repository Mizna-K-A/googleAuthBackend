// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/router.js');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
