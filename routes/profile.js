const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id);
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      console.log('No profile found, creating new one');
      // Create a new profile if it doesn't exist
      profile = new Profile({
        userId: req.user.id
      });
      await profile.save();
    }
    
    console.log('Profile found/created:', profile);
    res.json(profile);
  } catch (err) {
    console.error('Error in GET /api/profile/me:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   PUT /api/profile/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', req.body);
    
    const { avatar, bio, college } = req.body;
    
    // Find profile or create new one
    let profile = await Profile.findOne({ userId: req.user.id });
    
    if (!profile) {
      console.log('No profile found, creating new one');
      profile = new Profile({
        userId: req.user.id
      });
    }
    
    // Update fields
    if (avatar !== undefined) profile.avatar = avatar;
    if (bio !== undefined) profile.bio = bio;
    if (college !== undefined) profile.college = college;
    
    await profile.save();
    console.log('Profile updated successfully:', profile);
    res.json(profile);
  } catch (err) {
    console.error('Error in PUT /api/profile/me:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router; 