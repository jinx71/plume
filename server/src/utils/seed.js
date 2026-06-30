require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');

// Demo accounts — computing pioneers, fitting Plume's quiet/thoughtful tone.
// Every account shares the same password so the app is trivial to explore.
const PASSWORD = 'password123';

const USERS = [
  { username: 'ada', name: 'Ada Lovelace', email: 'ada@plume.app', bio: 'Writing the first notes. Poetical science.' },
  { username: 'grace', name: 'Grace Hopper', email: 'grace@plume.app', bio: 'Compiling thoughts. It is easier to ask forgiveness than permission.' },
  { username: 'alan', name: 'Alan Turing', email: 'alan@plume.app', bio: 'Can machines think? Asking for a friend.' },
  { username: 'katherine', name: 'Katherine Johnson', email: 'katherine@plume.app', bio: 'Doing the math. Twice, to be sure.' },
  { username: 'linus', name: 'Linus T.', email: 'linus@plume.app', bio: 'Talk is cheap. Show me the plume.' },
  { username: 'margaret', name: 'Margaret Hamilton', email: 'margaret@plume.app', bio: 'Software engineering — yes, that was the point.' },
];

// content + author username + how many minutes ago it was posted
const POSTS = [
  ['Just shipped a tiny thing and it feels enormous. Small wins compound.', 'ada', 8],
  ['A feather is light, but a thousand of them lift a bird. Keep posting.', 'grace', 21],
  ['Spent the morning deleting code. Best refactor is the line that no longer exists.', 'linus', 44],
  ['Reminder: the first computer bug was an actual moth. We have come so far, and not far at all.', 'grace', 73],
  ['If it works, do not touch it. If it does not, do not panic — read the error message.', 'alan', 96],
  ['Checked the numbers three times. They checked back.', 'katherine', 130],
  ['Naming things is hard. I have named this post "post".', 'margaret', 165],
  ['Wrote 200 words today, kept 40. That is the job.', 'ada', 210],
  ['The machine does exactly what you tell it. That is the whole problem.', 'alan', 290],
  ['Onboarding new tools is just speedrunning other people opinions.', 'linus', 360],
  ['Coffee, then commits. In that order, every time.', 'margaret', 480],
  ['A good question is worth ten answers.', 'katherine', 640],
  ['Less, but better. Then a little less again.', 'ada', 900],
  ['Deploy on a Friday, they said. It will be fine, they said.', 'grace', 1200],
];

// Who follows whom — keeps the home feed of `ada` populated on first login.
const FOLLOWS = {
  ada: ['grace', 'alan', 'katherine', 'margaret'],
  grace: ['ada', 'linus'],
  alan: ['ada', 'grace'],
  katherine: ['ada', 'margaret'],
  linus: ['grace', 'margaret'],
  margaret: ['ada', 'katherine', 'grace'],
};

const run = async () => {
  await connectDB();

  console.log('… clearing existing users and posts');
  await Promise.all([User.deleteMany({}), Post.deleteMany({})]);

  // Create users (create() runs the pre-save hooks -> hashing + Gravatar).
  const byName = {};
  for (const u of USERS) {
    const user = await User.create({ ...u, password: PASSWORD });
    byName[u.username] = user;
  }
  console.log(`✓ created ${USERS.length} users`);

  // Build the follow graph, keeping both sides of each edge in sync.
  for (const [follower, targets] of Object.entries(FOLLOWS)) {
    const me = byName[follower];
    for (const t of targets) {
      const target = byName[t];
      await User.updateOne({ _id: me._id }, { $addToSet: { following: target._id } });
      await User.updateOne({ _id: target._id }, { $addToSet: { followers: me._id } });
    }
  }
  console.log('✓ wired the follow graph');

  // Create posts and backdate createdAt so the timeline reads realistically.
  const created = [];
  for (const [content, username, minsAgo] of POSTS) {
    const author = byName[username];
    const post = await Post.create({ content, author: author._id });
    const when = new Date(Date.now() - minsAgo * 60 * 1000);
    await Post.updateOne({ _id: post._id }, { $set: { createdAt: when } }, { timestamps: false });
    created.push(post);
  }
  console.log(`✓ created ${POSTS.length} plumes`);

  // Sprinkle some likes so counts aren't all zero.
  const everyone = Object.values(byName);
  for (const post of created) {
    const likers = everyone.filter(() => Math.random() < 0.4).map((u) => u._id);
    if (likers.length) await Post.updateOne({ _id: post._id }, { $set: { likes: likers } });
  }
  console.log('✓ added some likes');

  console.log('\n──────────────────────────────────────────────');
  console.log(' Seed complete. Demo accounts (password for all):');
  console.log(`   ${PASSWORD}`);
  USERS.forEach((u) => console.log(`   • ${u.email}  (@${u.username})`));
  console.log(' Suggested login:  ada@plume.app');
  console.log('──────────────────────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('✗ Seed failed:', err);
  process.exit(1);
});
