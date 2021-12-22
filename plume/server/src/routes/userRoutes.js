const express = require('express');
const { body } = require('express-validator');
const {
  getSuggestions,
  searchUsers,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All user routes require a session.
router.use(protect);

router.get('/suggestions', getSuggestions);
router.get('/search', searchUsers);

router.put(
  '/me',
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be 1–50 characters'),
    body('bio').optional().trim().isLength({ max: 160 }).withMessage('Bio cannot exceed 160 characters'),
  ],
  validate,
  updateProfile
);

router.post('/:id/follow', followUser);
router.delete('/:id/follow', unfollowUser);

// Username-scoped reads come last so they don't shadow the static paths above.
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);
router.get('/:username', getProfile);

module.exports = router;
