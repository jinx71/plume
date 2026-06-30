require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Security & core middleware ---------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate-limit the API surface. Auth gets a tighter limiter to blunt brute force.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — slow down and try again shortly', errors: [] },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts — please wait a few minutes', errors: [] },
});

// --- Routes ------------------------------------------------------------------
app.get('/api/health', (req, res) =>
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() }, message: 'Plume API is healthy' })
);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/posts', apiLimiter, postRoutes);

// --- Error handling (must come last) ----------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- Boot --------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`✓ Plume API running on http://localhost:${PORT}`);
    console.log(`  Realtime + REST sharing one port. Client expected at ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });
};

start();

// Don't leave a half-dead process on an unhandled rejection.
process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
