const jwt = require('jsonwebtoken');

// Signs a short JWT carrying only the user id. The id is enough — the
// `protect` middleware re-loads the fresh user document from Mongo on
// every request, so we never trust stale claims baked into the token.
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = generateToken;
