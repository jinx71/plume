const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');
const generateToken = require('../utils/generateToken');
const { shapeMe } = require('../utils/shape');

// POST /api/auth/register
// Creates the account, hashes the password (model pre-save hook), and returns
// a signed token so the new user is logged in immediately.
const register = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { username }] });
  if (exists) {
    const field = exists.email === email.toLowerCase() ? 'email' : 'username';
    return failure(res, { status: 409, message: `That ${field} is already taken` });
  }

  const user = await User.create({ username, name, email, password });

  return success(res, {
    status: 201,
    message: 'Welcome to Plume',
    data: { token: generateToken(user._id), user: shapeMe(user) },
  });
});

// POST /api/auth/login
// We must explicitly re-select the password (it's select:false on the schema)
// to run the bcrypt comparison.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return failure(res, { status: 401, message: 'Invalid email or password' });
  }

  return success(res, {
    message: 'Signed in',
    data: { token: generateToken(user._id), user: shapeMe(user) },
  });
});

// GET /api/auth/me  (protected)
// Returns the live record for the token holder — used to re-hydrate the
// session on page load.
const getMe = asyncHandler(async (req, res) =>
  success(res, { data: { user: shapeMe(req.user) } })
);

module.exports = { register, login, getMe };
