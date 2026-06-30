# 🪶 Plume

A minimalist, **real-time** social network built on the MERN stack. Follow a few people, post short thoughts ("plumes", max 280 characters), and watch the feed move the moment something happens — new plumes and likes arrive live over WebSockets, no refresh.

Plume is app #6 in a 12-app MERN portfolio and is the **whole-stack proof piece**: it exercises authentication, relational data, and real-time messaging end to end in one coherent product.

---

## ✨ The engineering lesson: a live feed done properly

Most of this app's value is in *how the realtime layer is wired*:

- **REST is the source of truth, Socket.io is the broadcast.** Writes (create / like / delete) always go through authenticated Express routes. After each successful write the controller emits a Socket.io event (`post:new`, `post:like`, `post:delete`) so every connected client updates instantly. Reads never depend on the socket, so the app degrades gracefully if the socket drops.
- **Live without hijacking the reader.** Incoming plumes are *buffered* behind a **"N new plumes"** pill instead of being jammed into the top of the feed. The user pulls them in when ready, so their scroll position is never yanked.
- **One source of truth on the client.** Likes are owned by the feed state and update optimistically, then reconcile with the server response. Realtime `post:like` events only patch the *count*, so numbers tick up live while your own heart only fills from your own action.
- **The follow graph drives relevance.** A follow is two synchronized Mongo writes (`$addToSet` on both sides); the home feed reads back `{ author: { $in: [me, ...following] } }`. The same realtime stream powers Home (followed authors only) and Explore (everyone) via a single relevance predicate.
- **Presence as proof.** A small connected-users counter ("N people here now") shows the socket is genuinely open.

The realtime engine lives in one reusable hook, [`client/src/hooks/usePostFeed.js`](client/src/hooks/usePostFeed.js), shared by every feed.

---

## 🧰 Tech stack (pinned to the 2021–2022 era)

**Frontend** — React 17.0.2 (CRA 5), React Router 6.3, axios 0.27.2, Tailwind CSS 3.1, socket.io-client 4.5, react-toastify 9, dayjs.

**Backend** — Node 16, Express 4.18, Mongoose 6.5 (MongoDB 5/6), Socket.io 4.5, jsonwebtoken 8.5, bcryptjs 2.4, helmet 6, express-validator 6.14, express-rate-limit 6, morgan, cors, dotenv.

---

## 📁 Project structure

```
plume/
├── client/                  # React (CRA) front end
│   ├── public/
│   └── src/
│       ├── api/             # axios instance + endpoint modules
│       ├── components/      # design system + feed/composer/layout
│       ├── context/         # AuthContext, SocketContext
│       ├── hooks/           # useAuth, useSocket, usePostFeed (realtime engine)
│       ├── pages/           # Login, Register, Home, Explore, Profile, NotFound
│       └── utils/
└── server/                  # Express + Mongoose + Socket.io API
    └── src/
        ├── config/          # db.js (Mongoose connect)
        ├── controllers/     # auth, users, posts
        ├── middleware/      # auth (protect), validate, errorHandler, notFound
        ├── models/          # User, Post
        ├── routes/          # authRoutes, userRoutes, postRoutes
        ├── utils/           # asyncHandler, apiResponse, shape, generateToken, seed
        ├── socket.js        # Socket.io init + emit helper
        └── server.js        # app wiring + HTTP server
```

---

## 🚀 Getting started

### Prerequisites
- **Node 16.x** (`node -v` → v16) and npm 8
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string

### 1. Install dependencies (two folders)
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables
```bash
# from the repo root
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Then edit `server/.env` and set a real `JWT_SECRET` (and `MONGO_URI` if not using the local default).

| File | Variable | Purpose |
|---|---|---|
| `server/.env` | `PORT` | API port (default 5000) |
| | `MONGO_URI` | MongoDB connection string |
| | `JWT_SECRET` | Secret used to sign JWTs |
| | `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| | `CLIENT_URL` | Allowed origin for CORS + Socket.io |
| `client/.env` | `REACT_APP_API_URL` | Base URL of the REST API |
| | `REACT_APP_SOCKET_URL` | Origin of the Socket.io server |

### 3. Seed demo data (optional but recommended)
```bash
cd server
npm run seed
```
This creates demo users, a follow graph, and a timeline of plumes.

### 4. Run both apps with one command
```bash
# from the server folder
npm run dev
```
`concurrently` boots the API (http://localhost:5000) and the React client (http://localhost:3000) together.

> Prefer separate terminals? Run `npm run server` in `server/` and `npm start` in `client/`.

---

## 🔑 Demo accounts

All seeded accounts share the password **`password123`**.

| Email | Handle |
|---|---|
| `ada@plume.app` | @ada |
| `grace@plume.app` | @grace |
| `alan@plume.app` | @alan |
| `katherine@plume.app` | @katherine |
| `linus@plume.app` | @linus |
| `margaret@plume.app` | @margaret |

The login screen also has an **"Explore with a demo account"** button that signs you in as **@ada** instantly.

> **Tip:** to *see* the realtime layer, open two browser windows signed in as different users (or one normal + one incognito). Post or like in one and watch the other update live.

---

## 🌐 API overview

All responses use a shared envelope: `{ success, data, message }` (and `errors` on failure).

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Users** — `GET /api/users/suggestions`, `GET /api/users/search?q=`, `GET /api/users/:username`, `PUT /api/users/me`, `POST /api/users/:id/follow`, `DELETE /api/users/:id/follow`, `GET /api/users/:username/followers`, `GET /api/users/:username/following`

**Posts** — `GET /api/posts/feed`, `GET /api/posts/explore`, `GET /api/posts/user/:username`, `GET /api/posts/:id`, `POST /api/posts`, `POST /api/posts/:id/like`, `DELETE /api/posts/:id`

**Realtime events** (server → client): `presence:count`, `post:new`, `post:like`, `post:delete`

---

## 🔒 Security notes

- Passwords are hashed with bcryptjs and never leave the database (`select: false`).
- All write routes are JWT-protected; roles are never accepted from the client.
- `helmet`, CORS, request validation (express-validator), and rate limiting are enabled on the API.
- The JWT is stored in `localStorage` via `AuthContext` for portfolio simplicity — `httpOnly` cookies are the more secure production choice (noted in `client/src/api/client.js`).

---

## 📸 Screenshots

_Add screenshots here:_
- `docs/home.png` — home feed + composer with the character ring
- `docs/explore.png` — explore feed + people search
- `docs/realtime.png` — two windows showing a live "N new plumes" pill
- `docs/profile.png` — profile with follow + edit

---

## ✅ Definition of Done

- [x] `npm install` in both folders, then one command boots client + server (`concurrently`)
- [x] `.env.example` in client and server; real `.env` git-ignored; no secrets committed
- [x] README with features, tech stack + versions, setup, env vars, screenshot placeholders
- [x] Responsive mobile + desktop; accessibility basics (semantic HTML, labels, focus, reduced motion)
- [x] Loading / empty / error states on every async view
- [x] Shared design system + the app's indigo accent
- [x] Forms validated client **and** server
- [x] Auth + protected routes; no passwords leaked
- [x] Real-time feed, likes, presence over Socket.io

---

Built as a learning + showcase project. MIT licensed.
