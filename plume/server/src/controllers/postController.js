const mongoose = require('mongoose');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { shapePost } = require('../utils/shape');
const { emitToAll } = require('../socket');

const AUTHOR_FIELDS = 'username name avatar';

// Shared pagination parsing for the feeds. Returns newest-first with a small
// default page size suited to an infinite/"load more" feed.
const parsePaging = (req) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

// GET /api/posts/feed  (protected)
// Home timeline: only plumes from people the viewer follows, plus their own.
// This is the read side of the follow graph built in the user controller.
const getFeed = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req);
  const authorIds = [req.user._id, ...req.user.following];

  const filter = { author: { $in: authorIds } };
  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);

  return success(res, {
    data: {
      posts: posts.map((p) => shapePost(p, req.user._id)),
      page,
      hasMore: skip + posts.length < total,
    },
  });
});

// GET /api/posts/explore  (protected) — every plume, newest first.
const getExplore = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req);

  const [posts, total] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Post.countDocuments(),
  ]);

  return success(res, {
    data: {
      posts: posts.map((p) => shapePost(p, req.user._id)),
      page,
      hasMore: skip + posts.length < total,
    },
  });
});

// GET /api/posts/user/:username  (protected) — a single user's plumes.
const getUserPosts = asyncHandler(async (req, res) => {
  const User = mongoose.model('User');
  const user = await User.findOne({ username: req.params.username });
  if (!user) return failure(res, { status: 404, message: 'That account does not exist' });

  const { page, limit, skip } = parsePaging(req);
  const filter = { author: user._id };
  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);

  return success(res, {
    data: {
      posts: posts.map((p) => shapePost(p, req.user._id)),
      page,
      hasMore: skip + posts.length < total,
    },
  });
});

// GET /api/posts/:id  (protected)
const getPost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return failure(res, { status: 400, message: 'Invalid post id' });
  }
  const post = await Post.findById(req.params.id).populate('author', AUTHOR_FIELDS);
  if (!post) return failure(res, { status: 404, message: 'That plume does not exist' });
  return success(res, { data: { post: shapePost(post, req.user._id) } });
});

// POST /api/posts  (protected)
// Creates the plume, then broadcasts it to every connected client so it lands
// in their feed live. A fresh post has no likes, so the broadcast shape is
// viewer-agnostic (isLiked:false everywhere) — each client decides whether to
// show it (explore shows all; home shows it only if they follow the author).
const createPost = asyncHandler(async (req, res) => {
  const content = (req.body.content || '').trim();
  if (!content) return failure(res, { status: 400, message: 'A plume cannot be empty' });

  let post = await Post.create({ content, author: req.user._id });
  post = await post.populate('author', AUTHOR_FIELDS);

  const payload = shapePost(post, null);
  emitToAll('post:new', payload);

  return success(res, {
    status: 201,
    message: 'Plume posted',
    data: { post: shapePost(post, req.user._id) },
  });
});

// POST /api/posts/:id/like  (protected)
// Toggle like. $addToSet / $pull keep the likes array free of duplicates no
// matter how fast the heart is tapped. We broadcast just the new count so
// every client's number ticks in realtime; each client flips its own heart
// from its own action (you don't "like" because someone else did).
const toggleLike = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return failure(res, { status: 400, message: 'Invalid post id' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return failure(res, { status: 404, message: 'That plume does not exist' });

  const already = post.likes.some((id) => id.toString() === req.user._id.toString());
  const update = already
    ? { $pull: { likes: req.user._id } }
    : { $addToSet: { likes: req.user._id } };

  await Post.updateOne({ _id: post._id }, update);
  const fresh = await Post.findById(post._id);

  emitToAll('post:like', { postId: fresh._id.toString(), likeCount: fresh.likes.length });

  return success(res, {
    data: { postId: fresh._id, isLiked: !already, likeCount: fresh.likes.length },
  });
});

// DELETE /api/posts/:id  (protected) — author only. Broadcast removal so it
// disappears from open feeds in realtime.
const deletePost = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return failure(res, { status: 400, message: 'Invalid post id' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return failure(res, { status: 404, message: 'That plume does not exist' });
  if (post.author.toString() !== req.user._id.toString()) {
    return failure(res, { status: 403, message: 'You can only delete your own plumes' });
  }

  await post.deleteOne();
  emitToAll('post:delete', { postId: post._id.toString() });

  return success(res, { message: 'Plume deleted', data: { postId: post._id } });
});

module.exports = {
  getFeed,
  getExplore,
  getUserPosts,
  getPost,
  createPost,
  toggleLike,
  deletePost,
};
