const { validationResult } = require('express-validator');
const { failure } = require('../utils/apiResponse');

// Runs after a route's validation chain. If anything failed, short-circuits
// with the standard envelope listing each field error; otherwise continues.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.param, message: e.msg }));
  return failure(res, { status: 422, message: 'Please fix the highlighted fields', errors });
};

module.exports = validate;
