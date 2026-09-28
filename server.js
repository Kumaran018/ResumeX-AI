const dotenv = require('dotenv');
// Load environment variables before anything else
dotenv.config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middlewares/errorHandler');
const { AppError } = require('./src/utils/errors');
const path = require('path');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/resumes', require('./src/routes/resumeRoutes'));
app.use('/api/jobs', require('./src/routes/jobRoutes'));
app.use('/api/analyses', require('./src/routes/analysisRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// Analyze specific endpoint (alias for analysis creation as requested in prompt)
app.post('/api/analyze', require('./src/middlewares/auth').protect, require('./src/controllers/analysisController').analyze);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy and running.' });
});

// Unhandled Routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
