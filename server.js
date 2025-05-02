const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
// Try a different port
const PORT = 8080; // Changed from process.env.PORT || 5000

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutube')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const categoryRoutes = require('./routes/categories');
const progressRoutes = require('./routes/progress');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/progress', progressRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('project/dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'project', 'dist', 'index.html'));
  });
}

// Add basic routes for testing
app.get('/', (req, res) => {
  res.send('EduTube API is running');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test endpoint is working' });
});

app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}`);
});
