const mongoose = require('mongoose');

// Connects to MongoDB. Mongoose 6 already defaults to the sensible
// connection options (useNewUrlParser / useUnifiedTopology), so the
// connect call stays clean. We fail fast: if the DB is unreachable the
// process exits rather than serving a half-broken API.
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('✗ MONGO_URI is not set. Copy server/.env.example to server/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`✗ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
