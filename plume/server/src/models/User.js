const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // Never ship the hash to the client by default — must be explicitly
      // .select('+password') for the login comparison.
      select: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [160, 'Bio cannot exceed 160 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    // The two sides of the social graph. Mongo "relationships" here are
    // arrays of ObjectId references that we keep in sync on follow/unfollow.
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Convenience counts so the client doesn't have to measure array lengths.
userSchema.virtual('followerCount').get(function () {
  return this.followers ? this.followers.length : 0;
});
userSchema.virtual('followingCount').get(function () {
  return this.following ? this.following.length : 0;
});

// Hash the password before save — only when it actually changed, so profile
// edits don't re-hash an already-hashed value.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Default avatar = Gravatar derived from the email (identicon fallback so
// every user gets a distinct image even without a Gravatar account).
userSchema.pre('save', function (next) {
  if (!this.avatar) {
    const hash = crypto
      .createHash('md5')
      .update(this.email.trim().toLowerCase())
      .digest('hex');
    this.avatar = `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  }
  next();
});

userSchema.methods.matchPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
