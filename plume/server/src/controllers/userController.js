const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const { shapeMe, shapeUser } = require('../utils/shape');

// GET /api/users/suggestions  (protected)
// "Who to follow" — people the current user doesn't already follow and isn't
// themselves. Newest accounts first, capped small for a sidebar.
const getSuggestions = asyncHandler(async (req, res) => {
  const me = req.user;
  const exclude = [me._id, ...me.following];
  const users = await User.find({ _id: { $nin: exclude } })
    .sort({ createdAt: -1 })
    .limit(5);
  return success(res, { data: { users: users.map((u) => shapeUser(u, me._id)) } });
});

// GET /api/users/search?q=  (protected)
const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return success(res, { data: { users: [] } });

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({
    $and: [{ _id: { $ne: req.user._id } }, { $or: [{ username: regex }, { name: regex }] }],
  }).limit(10);

  return success(res, { data: { users: users.map((u) => shapeUser(u, req.user._id)) } });
});

// GET /api/users/:username  (protected)
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return failure(res, { status: 404, message: 'That account does not exist' });
  return success(res, { data: { user: shapeUser(user, req.user._id) } });
});

// PUT /api/users/me  (protected) — edit own name / bio
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  if (typeof name === 'string') req.user.name = name;
  if (typeof bio === 'string') req.user.bio = bio;
  await req.user.save();
  return success(res, { message: 'Profile updated', data: { user: shapeMe(req.user) } });
});

// POST /api/users/:id/follow  (protected)
// The heart of the Mongo-relationships lesson: a follow is two writes that
// must stay in sync — push the target into MY `following`, and push ME into
// the target's `followers`. $addToSet makes the operation idempotent so a
// double-tap can never create duplicate edges in the graph.
const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return failure(res, { status: 400, message: 'Invalid user id' });
  }
  if (targetId === req.user._id.toString()) {
    return failure(res, { status: 400, message: 'You cannot follow yourself' });
  }

  const target = await User.findById(targetId);
  if (!target) return failure(res, { status: 404, message: 'That account does not exist' });

  await Promise.all([
    User.updateOne({ _id: req.user._id }, { $addToSet: { following: target._id } }),
    User.updateOne({ _id: target._id }, { $addToSet: { followers: req.user._id } }),
  ]);

  const updatedTarget = await User.findById(targetId);
  return success(res, {
    message: `You are now following @${target.username}`,
    data: { user: shapeUser(updatedTarget, req.user._id) },
  });
});

// DELETE /api/users/:id/follow  (protected) — the mirror operation, $pull both sides.
const unfollowUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    return failure(res, { status: 400, message: 'Invalid user id' });
  }

  const target = await User.findById(targetId);
  if (!target) return failure(res, { status: 404, message: 'That account does not exist' });

  await Promise.all([
    User.updateOne({ _id: req.user._id }, { $pull: { following: target._id } }),
    User.updateOne({ _id: target._id }, { $pull: { followers: req.user._id } }),
  ]);

  const updatedTarget = await User.findById(targetId);
  return success(res, {
    message: `You unfollowed @${target.username}`,
    data: { user: shapeUser(updatedTarget, req.user._id) },
  });
});

// GET /api/users/:username/followers  (protected)
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate({
    path: 'followers',
    select: 'username name avatar bio followers following',
  });
  if (!user) return failure(res, { status: 404, message: 'That account does not exist' });
  return success(res, { data: { users: user.followers.map((u) => shapeUser(u, req.user._id)) } });
});

// GET /api/users/:username/following  (protected)
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate({
    path: 'following',
    select: 'username name avatar bio followers following',
  });
  if (!user) return failure(res, { status: 404, message: 'That account does not exist' });
  return success(res, { data: { users: user.following.map((u) => shapeUser(u, req.user._id)) } });
});

module.exports = {
  getSuggestions,
  searchUsers,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
