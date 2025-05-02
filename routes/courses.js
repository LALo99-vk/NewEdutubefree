const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('category', 'name icon');
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
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const {
      title,
      description,
      instructor,
      thumbnail,
      category,
      level,
      modules
    } = req.body;
    
    // Create new course
    const newCourse = new Course({
      title,
      description,
      instructor,
      thumbnail,
      category,
      level,
      modules
    });
    
    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
