const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edutube', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected Successfully');
    console.log('Using database:', mongoose.connection.db.databaseName);
    // Debug: Check if courses collection exists
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('Available collections:', collections.map(c => c.name));
    // Debug: Get count of courses
    return mongoose.connection.db.collection('courses').countDocuments();
  })
  .then(count => {
    console.log(`Current number of courses in database: ${count}`);
    // Debug: List all courses
    return mongoose.connection.db.collection('courses').find().toArray();
  })
  .then(courses => {
    console.log('Current courses:', courses.map(c => ({ id: c._id, title: c.title })));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const categoryRoutes = require('./routes/categories');
const progressRoutes = require('./routes/progress');
const profileRoutes = require('./routes/profile');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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

// Add a specific test endpoint for the profile issue
app.get('/api/debug/auth-test', (req, res) => {
  res.json({ 
    message: 'Auth test endpoint is working',
    timestamp: new Date().toISOString(),
    server: 'EduTube API',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the API at http://localhost:${PORT}`);
});
