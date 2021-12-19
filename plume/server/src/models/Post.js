const mongoose = require('mongoose');

const POST_MAX = 280;

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'A plume cannot be empty'],
      trim: true,
      maxlength: [POST_MAX, `A plume cannot exceed ${POST_MAX} characters`],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Likes as an array of user ids — keeps "has the current user liked
    // this?" a simple membership check and the count an array length.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Newest-first feed reads hit this compound-ish sort constantly.
postSchema.index({ createdAt: -1 });

postSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

postSchema.statics.MAX_LENGTH = POST_MAX;

module.exports = mongoose.model('Post', postSchema);
