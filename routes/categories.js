const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const { name, icon } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    if (category) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    
    // Create new category
    category = new Category({
      name,
      icon
    });
    
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    const { name, icon } = req.body;
    
    // Update category
    if (name) category.name = name;
    if (icon) category.icon = icon;
    
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if any courses are using this category
    const coursesWithCategory = await Course.countDocuments({ category: req.params.id });
    if (coursesWithCategory > 0) {
      return res.status(400).json({ msg: 'Cannot delete category as it is used by courses' });
    }
    
    await category.deleteOne();
    
    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET /api/categories/count
// @desc    Update course count for categories
// @access  Private/Admin
router.get('/update-count/admin', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const categories = await Category.find();
    
    for (const category of categories) {
      const count = await Course.countDocuments({ category: category._id });
      category.count = count;
      await category.save();
    }
    
    res.json({ msg: 'Category counts updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
