// Tiny helpers so every route returns the same shape across all 12 apps:
//   success -> { success: true, data, message }
//   failure -> { success: false, message, errors }
const success = (res, { status = 200, data = null, message } = {}) =>
  res.status(status).json({ success: true, data, message });

const failure = (res, { status = 400, message = 'Something went wrong', errors = [] } = {}) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { success, failure };
