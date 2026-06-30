// Centralizes how Mongo documents are turned into API payloads so every
// controller emits the same shape and no route ever leaks the password hash.

// The authenticated user looking at their own record — includes email and the
// raw follow graph (arrays of ids) the client needs to compute relationships.
const shapeMe = (u) => ({
  id: u._id,
  username: u.username,
  name: u.name,
  email: u.email,
  bio: u.bio,
  avatar: u.avatar,
  following: u.following.map((id) => id.toString()),
  followers: u.followers.map((id) => id.toString()),
  followingCount: u.following.length,
  followerCount: u.followers.length,
  createdAt: u.createdAt,
});

// Any other user (profile pages, suggestions, follower lists). No email.
// `isFollowing` / `isSelf` are computed against the viewer when provided.
const shapeUser = (u, viewerId) => {
  const followers = u.followers || [];
  const following = u.following || [];
  return {
    id: u._id,
    username: u.username,
    name: u.name,
    bio: u.bio,
    avatar: u.avatar,
    followerCount: followers.length,
    followingCount: following.length,
    isFollowing: viewerId ? followers.some((id) => id.toString() === viewerId.toString()) : false,
    isSelf: viewerId ? u._id.toString() === viewerId.toString() : false,
    createdAt: u.createdAt,
  };
};

// A post with its populated author and a viewer-relative `isLiked` flag.
const shapePost = (p, viewerId) => {
  const likes = p.likes || [];
  const author = p.author || {};
  return {
    id: p._id,
    content: p.content,
    likeCount: likes.length,
    isLiked: viewerId ? likes.some((id) => id.toString() === viewerId.toString()) : false,
    author: {
      id: author._id,
      username: author.username,
      name: author.name,
      avatar: author.avatar,
    },
    createdAt: p.createdAt,
  };
};

module.exports = { shapeMe, shapeUser, shapePost };
