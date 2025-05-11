const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edutube', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected successfully for seeding');
    console.log('Database name:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Category.deleteMany({});

    console.log('Data cleared successfully');

    // Create admin and test user
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date()
    });

    const testUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      createdAt: new Date()
    });

    console.log('Users created successfully:', { admin: admin._id, testUser: testUser._id });

    // Create categories
    console.log('Creating categories...');
    const webDevCategory = await Category.create({
      name: 'Web Development',
      icon: 'code',
      count: 0
    });

    const dataScience = await Category.create({
      name: 'Data Science',
      icon: 'analytics',
      count: 0
    });

    const mobileDev = await Category.create({
      name: 'Mobile Development',
      icon: 'smartphone',
      count: 0
    });

    const design = await Category.create({
      name: 'Design',
      icon: 'brush',
      count: 0
    });

    console.log('Categories created successfully:', {
      webDev: webDevCategory._id,
      dataScience: dataScience._id,
      mobileDev: mobileDev._id,
      design: design._id
    });

    // Create courses
    console.log('Creating courses...');
    const reactCourse = await Course.create({
      title: 'React Masterclass',
      description: 'Learn React from beginner to advanced level with practical projects',
      instructor: 'John Smith',
      thumbnail: 'https://placehold.co/600x400?text=React+Course',
      category: webDevCategory._id,
      level: 'intermediate',
      rating: 4.8,
      totalStudents: 1543,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          title: 'Introduction to React',
          lessons: [
            {
              title: 'Getting Started with React',
              description: 'Learn the basics of React and its core concepts',
              duration: '15:30',
              videoUrl: 'https://example.com/videos/react-intro'
            },
            {
              title: 'Components and Props',
              description: 'Understanding React components and properties',
              duration: '22:15',
              videoUrl: 'https://example.com/videos/react-components'
            }
          ]
        },
        {
          title: 'React Hooks',
          lessons: [
            {
              title: 'useState and useEffect',
              description: 'Learn the most important React hooks',
              duration: '28:45',
              videoUrl: 'https://example.com/videos/react-hooks'
            }
          ]
        }
      ]
    });

    console.log('React course created successfully:', reactCourse._id);

    const pythonCourse = await Course.create({
      title: 'Python for Data Science',
      description: 'Learn Python programming for data analysis and visualization',
      instructor: 'Sarah Johnson',
      thumbnail: 'https://placehold.co/600x400?text=Python+Course',
      category: dataScience._id,
      level: 'beginner',
      rating: 4.6,
      totalStudents: 2187,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          title: 'Python Basics',
          lessons: [
            {
              title: 'Introduction to Python',
              description: 'Learn the basics of Python programming language',
              duration: '18:20',
              videoUrl: 'https://example.com/videos/python-intro'
            },
            {
              title: 'Data Types and Variables',
              description: 'Understanding Python data types and variables',
              duration: '24:10',
              videoUrl: 'https://example.com/videos/python-data-types'
            }
          ]
        }
      ]
    });

    console.log('Python course created successfully:', pythonCourse._id);

    const flutterCourse = await Course.create({
      title: 'Flutter App Development',
      description: 'Create beautiful mobile apps with Flutter framework',
      instructor: 'Michael Chen',
      thumbnail: 'https://placehold.co/600x400?text=Flutter+Course',
      category: mobileDev._id,
      level: 'advanced',
      rating: 4.9,
      totalStudents: 1157,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          title: 'Flutter Fundamentals',
          lessons: [
            {
              title: 'Getting Started with Flutter',
              description: 'Setup your development environment for Flutter',
              duration: '20:15',
              videoUrl: 'https://example.com/videos/flutter-intro'
            }
          ]
        }
      ]
    });

    console.log('Flutter course created successfully:', flutterCourse._id);

    // Update category counts
    console.log('Updating category counts...');
    await Category.findByIdAndUpdate(webDevCategory._id, { count: 1 });
    await Category.findByIdAndUpdate(dataScience._id, { count: 1 });
    await Category.findByIdAndUpdate(mobileDev._id, { count: 1 });

    console.log('Categories updated successfully');
    console.log('Database seeded successfully!');
    
    // Verify the data was created
    const finalUsers = await User.find().select('-password');
    const finalCourses = await Course.find();
    const finalCategories = await Category.find();
    
    console.log('\nFinal Database State:');
    console.log('Users:', finalUsers.length);
    console.log('Courses:', finalCourses.length);
    console.log('Categories:', finalCategories.length);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
