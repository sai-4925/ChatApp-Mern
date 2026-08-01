# ChatApp — Real-Time MERN Messaging Application

A production-ready, WhatsApp-inspired real-time chat application built end-to-end on the
MERN stack (MongoDB, Express, React, Node.js) with Socket.io. Built as a portfolio-grade
project with clean architecture, full test coverage of core flows, and CI/CD configuration.

> **Note on originality:** This project is *inspired by* modern messaging apps like WhatsApp
> but uses an original visual design (electric indigo / coral / mint palette, custom
> typography, asymmetric bubble shapes) and no copyrighted assets or branding.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

**Authentication**
- Register / login / logout with JWT (access + refresh tokens)
- "Remember me", password hashing (bcrypt), forgot/reset password flow
- Protected routes on both API and frontend

**Messaging**
- Real-time one-to-one and group chat (Socket.io)
- Typing indicators, delivered/seen receipts, online presence
- Reply, forward, star, edit, delete for me / delete for everyone
- Emoji reactions, message search within a conversation
- Message grouping by date, infinite scroll pagination

**Media**
- Image, video, audio, and document sharing via Cloudinary
- Upload validation (type/size limits) with previews before sending

**Groups**
- Create groups, add/remove members, promote/demote admins
- Group name, description, and avatar management

**Organization**
- Pin, archive, and mute conversations; per-chat wallpaper
- Unread badges, notification center with read/unread state

**Settings**
- Light / dark / system theme
- Notification (sound/browser) and privacy (last seen, read receipts) controls
- Change password, block/unblock users, manage contacts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 (Vite), React Router, Context API, Tailwind CSS, Axios, Socket.io Client |
| Backend | Node.js, Express.js, Socket.io, JWT, bcrypt |
| Database | MongoDB Atlas + Mongoose |
| Media | Cloudinary + Multer |
| Security | Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp, cors |
| Testing | Jest, Supertest, mongodb-memory-server |
| DevOps | Docker, Docker Compose, GitHub Actions (CI/CD) |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Architecture

```
┌───────────────────────────┐         HTTPS (REST)         ┌────────────────────────────┐
│        React Client       │ ─────────────────────────────▶│      Express.js API        │
│  (Vite, Context API,      │                                │  Controllers → Services    │
│   Tailwind, Socket.io-cli)│ ◀───────────────────────────── │  Middleware: auth/validate │
└─────────────┬─────────────┘        JSON responses          └──────────────┬─────────────┘
              │                                                             │
              │ WebSocket (Socket.io)                                      │ Mongoose ODM
              ▼                                                             ▼
┌───────────────────────────┐                                ┌────────────────────────────┐
│   Socket.io Server         │◀──────────shared HTTP server──▶│      MongoDB Atlas         │
│  socket/index.js           │                                │  Users, Conversations,      │
│  Rooms per conversation    │                                │  Messages, Groups,          │
│  online/typing/seen events │                                │  Notifications              │
└─────────────┬───────────────┘                              └────────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│        Cloudinary          │
│  Image/video/audio/doc     │
│  storage via Multer stream │
└───────────────────────────┘
```

**Request flow example (sending a text message):**
1. Client emits `send message` over the socket (or POSTs to `/api/messages` if a file is attached)
2. Controller/socket handler validates the sender is a conversation participant
3. Message is persisted via `messageService`, conversation's `lastMessage`/`unreadCounts` updated
4. Server emits `receive message` to everyone in the conversation's Socket.io room
5. A `Notification` document is created for each recipient and pushed to their personal room

---

## Folder Structure

```
chatapp/
├── .github/workflows/       # CI (lint/test) + CD (deploy) GitHub Actions
├── backend/
│   ├── config/               # db.js, cloudinary.js
│   ├── constants/             # shared enums (message types, pagination, etc.)
│   ├── controllers/           # thin HTTP layer — validates input, calls services
│   ├── helpers/                # small stateless helpers (cookie options, etc.)
│   ├── middleware/             # auth, error handling, rate limiting, uploads, validation
│   ├── models/                 # Mongoose schemas: User, Conversation, Message, Group, Notification
│   ├── routes/                 # Express routers
│   ├── services/                # business logic, DB queries
│   ├── socket/
│   │   ├── index.js             # Socket.io bootstrap
│   │   ├── socketAuth.js        # JWT handshake auth
│   │   ├── rooms.js             # room-naming helpers
│   │   └── events/              # message/typing/online/group/notification handlers
│   ├── tests/                   # Jest + Supertest test suite
│   ├── validators/               # express-validator chains
│   ├── app.js                   # Express app (importable for tests)
│   └── server.js                # HTTP + Socket.io entry point
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── chat/             # Sidebar, ChatWindow, MessageBubble, MessageInput, ...
│       │   ├── common/           # Button, Input, Avatar, Modal, Skeletons
│       │   ├── layout/           # MobileNav
│       │   └── modals/           # NewChatModal, NewGroupModal, ForwardMessageModal
│       ├── constants/
│       ├── context/              # AuthContext, SocketContext, ChatContext, ThemeContext
│       ├── hooks/                 # useAuth, useChat, useSocket, useTheme, useOnlineStatus...
│       ├── layouts/                # AuthLayout, DashboardLayout
│       ├── pages/                  # Landing, Login, Register, Dashboard, Profile, Settings, ...
│       ├── routes/                  # ProtectedRoute, PublicOnlyRoute
│       ├── services/                 # Axios API clients per resource
│       ├── sockets/                   # Socket.io client singleton
│       ├── utils/                     # date/token/conversation helpers
│       ├── App.jsx
│       └── main.jsx
├── docs/
│   ├── openapi.yaml            # OpenAPI 3.0 spec
│   └── postman_collection.json # Postman collection
├── docker-compose.yml
├── LICENSE / CONTRIBUTING.md / SECURITY.md / CHANGELOG.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas cluster (or local MongoDB / Docker)
- A Cloudinary account (free tier is fine)

### Clone and install

```bash
git clone https://github.com/<your-username>/chatapp.git
cd chatapp

cd backend && npm install
cd ../frontend && npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `7d`) |
| `JWT_REMEMBER_EXPIRES_IN` | Access token lifetime with "remember me" (e.g. `30d`) |
| `JWT_COOKIE_NAME` | Name of the httpOnly auth cookie |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `EMAIL_HOST` | SMTP hostname for sending password reset emails |
| `EMAIL_PORT` | SMTP port for sending password reset emails |
| `EMAIL_SECURE` | `true` when using a secure SMTP port (465), otherwise `false` |
| `EMAIL_USER` | SMTP username for the email account |
| `EMAIL_PASSWORD` | SMTP password for the email account |
| `EMAIL_FROM` | Optional sender address for outgoing emails |
| `CLIENT_URL` | Frontend origin, used for CORS (e.g. `http://localhost:5173`) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | API rate limiting config |

See `backend/.env.example` for a ready-to-copy template.

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the REST API (e.g. `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | Base URL of the Socket.io server (e.g. `http://localhost:5000`) |

See `frontend/.env.example`.

---

## Running Locally

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env   # fill in your values
npm run dev             # starts on http://localhost:5000

# Terminal 2 — frontend
cd frontend
cp .env.example .env
npm run dev             # starts on http://localhost:5173
```

Optionally seed demo data (creates 4 demo users, a 1:1 chat, and a group):

```bash
cd backend
npm run seed
```

All seeded accounts use the password `Password123`.

---

## Running with Docker

```bash
# from the repo root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker compose up --build
```

This starts MongoDB, the backend (port 5000), and the frontend (port 4173) together.

---

## Running Tests

```bash
cd backend
npm test
```

Tests use `mongodb-memory-server`, so no real database connection is required. Coverage
includes authentication, conversations, messages (send/edit/react/delete), and group
membership/admin permission checks.

---

## Deployment

### Backend → Render
1. Create a new Web Service on Render, pointing at the `backend/` directory.
2. Build command: `npm install`. Start command: `npm start`.
3. Add all variables from `backend/.env.example` under Render's Environment settings.
4. Copy the service's **Deploy Hook URL** into the `RENDER_DEPLOY_HOOK_URL` GitHub secret
   to enable the CD workflow in `.github/workflows/deploy.yml`.

### Frontend → Vercel
1. Import the repo into Vercel, set the root directory to `frontend/`.
2. Framework preset: Vite.
3. Add `VITE_API_BASE_URL` and `VITE_SOCKET_URL` pointing at your deployed Render backend.
4. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as GitHub secrets for the CD workflow.

### Database → MongoDB Atlas
1. Create a free (M0) cluster.
2. Add your Render service's outbound IPs (or `0.0.0.0/0` for simplicity) to the Atlas
   Network Access list.
3. Use the provided connection string as `MONGO_URI`.

Make sure `CLIENT_URL` on the backend matches your deployed frontend's exact origin,
since CORS is strictly enforced.

---

## API Documentation

Two equivalent references are provided:
- **OpenAPI**: [`docs/openapi.yaml`](./docs/openapi.yaml) — import into Swagger UI/Editor
- **Postman**: [`docs/postman_collection.json`](./docs/postman_collection.json) — import directly into Postman

---

## Screenshots

> _Add screenshots or a short demo GIF here once deployed, e.g.:_
>
> `![Chat dashboard](./docs/screenshots/dashboard.png)`
> `![Mobile view](./docs/screenshots/mobile.png)`

---

## Future Enhancements

- Voice message recording (waveform preview)
- Client-side image compression before upload
- End-to-end encryption for message content
- Chat export (PDF/JSON) and cloud backup
- Progressive Web App (installable, offline message queueing)
- Message pagination via cursor instead of page/limit for very large conversations
- Admin dashboard for moderation (reported users/messages)

---

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming,
commit conventions, and the PR checklist. Please also review [SECURITY.md](./SECURITY.md)
before reporting any vulnerabilities.

---

## License

Released under the [MIT License](./LICENSE).
