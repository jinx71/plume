const { failure } = require('../utils/apiResponse');

// Catches any request that didn't match a route and hands back the
// standard failure envelope instead of Express's default HTML page.
const notFound = (req, res) =>
  failure(res, { status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });

module.exports = notFound;
