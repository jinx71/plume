const { failure } = require('../utils/apiResponse');

// Single place every error funnels into (via asyncHandler). Translates the
// common Mongoose / auth failure modes into clean status codes + messages
// so controllers never have to format error responses themselves.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = [];

  // Bad ObjectId in a route param (e.g. /users/not-a-real-id)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Schema validation failed — surface each field message.
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Duplicate unique key (username / email already taken).
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already taken`;
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('✗', status, message);
    if (status === 500) console.error(err.stack);
  }

  return failure(res, { status, message, errors });
};

module.exports = errorHandler;
