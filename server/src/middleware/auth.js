const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { failure } = require('../utils/apiResponse');

// Verifies the Bearer token, then re-loads the user from Mongo so the
// request always operates on the live record (handles deleted users and
// avoids trusting anything but the id baked into the token).
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  }

  if (!token) {
    return failure(res, { status: 401, message: 'Not authorized — no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return failure(res, { status: 401, message: 'Not authorized — user no longer exists' });
    }
    req.user = user;
    next();
  } catch (err) {
    return failure(res, { status: 401, message: 'Not authorized — token is invalid or expired' });
  }
});

module.exports = { protect };
