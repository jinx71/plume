const express = require('express');
const { body } = require('express-validator');
const {
  getFeed,
  getExplore,
  getUserPosts,
  getPost,
  createPost,
  toggleLike,
  deletePost,
} = require('../controllers/postController');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/feed', getFeed);
router.get('/explore', getExplore);
router.get('/user/:username', getUserPosts);

router.post(
  '/',
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('A plume cannot be empty')
      .isLength({ max: Post.MAX_LENGTH })
      .withMessage(`A plume cannot exceed ${Post.MAX_LENGTH} characters`),
  ],
  validate,
  createPost
);

router.post('/:id/like', toggleLike);
router.delete('/:id', deletePost);
router.get('/:id', getPost);

module.exports = router;
