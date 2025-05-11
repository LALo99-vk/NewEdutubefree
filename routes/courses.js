const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('category', 'name');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('category', 'name icon');
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/courses
// @desc    Create a course
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    console.log('Course creation request received:', {
      user: req.user,
      body: req.body
    });

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const {
      title,
      description,
      instructor,
      thumbnail,
      videoUrl,
      category,
      level
    } = req.body;

    // Validate thumbnail URL
    let thumbnailUrl = thumbnail;
    if (!thumbnailUrl || !thumbnailUrl.startsWith('http')) {
      // Use a default thumbnail based on category
      const defaultThumbnails = {
        'Web Development': 'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
        'JavaScript': 'https://cdn.pixabay.com/photo/2019/10/03/12/12/javascript-4523100_1280.jpg',
        'Mobile Development': 'https://cdn.pixabay.com/photo/2016/12/28/09/36/web-1935737_1280.png',
        'Machine Learning': 'https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg',
        'DevOps': 'https://cdn.pixabay.com/photo/2018/02/15/10/35/server-3155000_1280.jpg',
        'UI/UX Design': 'https://cdn.pixabay.com/photo/2017/08/10/02/05/tiles-shapes-2617112_1280.jpg'
      };
      
      // Use a reliable placeholder service
      thumbnailUrl = defaultThumbnails[category.name] || 'https://placehold.co/640x360/2563eb/ffffff?text=Course+Thumbnail';
    }

    // Create new course with validated thumbnail
    const courseData = {
      title,
      description,
      instructor,
      thumbnail: thumbnailUrl,
      videoUrl,
      category: category.name || category._id,
      level
    };

    console.log('Creating new course with data:', courseData);

    const course = new Course(courseData);
    console.log('Attempting to save course:', course);

    await course.save();
    console.log('Course saved successfully');

    res.json(course);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    // Update course fields
    const updateFields = req.body;
    updateFields.updatedAt = Date.now();
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(updatedCourse);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    
    await course.deleteOne();
    
    res.json({ msg: 'Course removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/courses/featured
// @desc    Get featured courses
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const courses = await Course.find({ featured: true }).populate('category', 'name icon');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/courses/category/:categoryId
// @desc    Get courses by category
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const courses = await Course.find({ category: req.params.categoryId }).populate('category', 'name icon');
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
