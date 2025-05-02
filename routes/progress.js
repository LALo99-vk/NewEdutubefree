const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/progress
// @desc    Get all courses progress for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title thumbnail level'
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.enrolledCourses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/progress/:courseId
// @desc    Get progress for a specific course
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const courseProgress = user.enrolledCourses.find(
      course => course.course.toString() === req.params.courseId
    );
    
    if (!courseProgress) {
      return res.status(404).json({ msg: 'Course not found in enrolled courses' });
    }
    
    res.json(courseProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/progress/:courseId
// @desc    Enroll in a course
// @access  Private
router.post('/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if already enrolled
    const isEnrolled = user.enrolledCourses.some(
      course => course.course.toString() === req.params.courseId
    );
    
    if (isEnrolled) {
      return res.status(400).json({ msg: 'Already enrolled in this course' });
    }
    
    // Add to enrolled courses
    user.enrolledCourses.push({
      course: req.params.courseId,
      progress: 0,
      completedLessons: [],
      startDate: new Date(),
      lastAccessDate: new Date()
    });
    
    await user.save();
    
    res.json(user.enrolledCourses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/progress/:courseId
// @desc    Update course progress
// @access  Private
router.put('/:courseId', auth, async (req, res) => {
  try {
    const { lessonId, progress } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Find the course in enrolled courses
    const courseIndex = user.enrolledCourses.findIndex(
      course => course.course.toString() === req.params.courseId
    );
    
    if (courseIndex === -1) {
      return res.status(404).json({ msg: 'Course not found in enrolled courses' });
    }
    
    // Update progress
    if (progress !== undefined) {
      user.enrolledCourses[courseIndex].progress = progress;
    }
    
    // Add lesson to completed if provided
    if (lessonId && !user.enrolledCourses[courseIndex].completedLessons.includes(lessonId)) {
      user.enrolledCourses[courseIndex].completedLessons.push(lessonId);
    }
    
    // Update last access date
    user.enrolledCourses[courseIndex].lastAccessDate = new Date();
    
    await user.save();
    
    res.json(user.enrolledCourses[courseIndex]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
