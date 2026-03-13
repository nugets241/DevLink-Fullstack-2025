# DevLink

[![CI](https://github.com/nugets241/DevLink-Fullstack-2025/actions/workflows/ci.yml/badge.svg)](https://github.com/nugets241/DevLink-Fullstack-2025/actions/workflows/ci.yml)

A social networking platform for developers. Users create profiles, share posts, and interact through likes and comments.

**[CI Workflow](.github/workflows/ci.yml)** · **[GitHub Actions](https://github.com/nugets241/DevLink-Fullstack-2025/actions/workflows/ci.yml)**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [Testing](#testing)
8. [API Routes](#api-routes)
9. [CI/CD](#cicd)
10. [Troubleshooting](#troubleshooting)
11. [License](#license)

---

## Prerequisites

- Node.js `22.x`
- npm `10+`
- MongoDB Atlas cluster or local MongoDB instance

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/nugets241/DevLink-Fullstack-2025.git
cd DevLink-Fullstack-2025
npm ci && cd client && npm ci && cd ..

# 2. Create .env (copy the template and fill values)
# macOS/Linux
cp .env.example .env

# PowerShell
Copy-Item .env.example .env

# 3. Start development servers
npm run dev
```

API: `http://localhost:5000` | Client: `http://localhost:5173`

---

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 19, TypeScript, Vite, Redux |
| Backend  | Node.js 22, Express 5, Mongoose 8 |
| Database | MongoDB Atlas or local            |
| Auth     | JWT, Argon2id password hashing    |
| Testing  | Jest (backend), Vitest (frontend) |

---

## Project Structure

```
.
├── app.js, server.js, db.js           # Server entry points
├── controllers/                        # Business logic
├── routes/api/                         # API endpoints
├── middleware/                         # Middleware (auth, etc.)
├── models/                             # MongoDB schemas
├── tests/                              # Backend tests (39 tests)
└── client/
    └── src/
        ├── components/                 # React components
        ├── pages/                      # Page routes
        ├── store/                      # Redux slices
        └── tests/                      # Frontend tests (29 tests)
```

---

## Environment Variables

Create a `.env` file in the project root. The full server template lives in `.env.example`:

```env
# Required
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/devlink
JWT_SECRET=your-long-random-secret-here

# Optional (defaults shown)
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
JWT_EXPIRES_IN=1h
JWT_ISSUER=devlink-api
JWT_AUDIENCE=devlink-client

# Optional Argon2 tuning
ARGON2_TIME_COST=3
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=1
```

`MONGO_URI` and `JWT_SECRET` above are placeholder examples. Replace them with real values before running the server.

The server exits immediately if `MONGO_URI` or `JWT_SECRET` are missing, and startup will fail if `MONGO_URI` is invalid or unreachable.

The client does not require its own env file for local development. If needed, you can optionally set `VITE_API_URL` in `client/.env`.

---

## Running the App

| Command          | What it does                          |
| ---------------- | ------------------------------------- |
| `npm run dev`    | Starts API + Vite client (hot reload) |
| `npm run server` | API only                              |
| `npm run client` | Vite client only                      |
| `npm start`      | Production API                        |

### Run API only

```bash
npm run server
```

### Run frontend only

```bash
npm run client
```

---

## Testing

### Backend (39 tests)

```bash
npm test
```

Integration tests with in-memory MongoDB. No external services needed.

### Frontend (29 tests)

```bash
cd client
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage
```

---

## API Routes

All routes require `Authorization: Bearer <token>` except where noted.

| Method | Path                          | Auth | Description           |
| ------ | ----------------------------- | ---- | --------------------- |
| POST   | `/api/users`                  | –    | Register              |
| POST   | `/api/auth`                   | –    | Login                 |
| GET    | `/api/auth`                   | ✓    | Get current user      |
| PATCH  | `/api/users/me`               | ✓    | Update user           |
| GET    | `/api/profile`                | –    | List all profiles     |
| GET    | `/api/profile/me`             | ✓    | Get my profile        |
| PATCH  | `/api/profile`                | ✓    | Create/update profile |
| PUT    | `/api/profile/experience`     | ✓    | Add experience        |
| PATCH  | `/api/profile/experience/:id` | ✓    | Update experience     |
| DELETE | `/api/profile/experience/:id` | ✓    | Delete experience     |
| PUT    | `/api/profile/education`      | ✓    | Add education         |
| PATCH  | `/api/profile/education/:id`  | ✓    | Update education      |
| DELETE | `/api/profile/education/:id`  | ✓    | Delete education      |
| PUT    | `/api/profile/skills`         | ✓    | Add skill             |
| DELETE | `/api/profile/skills/:index`  | ✓    | Delete skill          |
| GET    | `/api/posts?page=1&limit=10`  | ✓    | Get post feed         |
| POST   | `/api/posts`                  | ✓    | Create post           |
| PUT    | `/api/posts/:id/like`         | ✓    | Like post             |
| PUT    | `/api/posts/:id/unlike`       | ✓    | Unlike post           |
| POST   | `/api/posts/:id/comments`     | ✓    | Add comment           |
| PATCH  | `/api/posts/:id/comments/:id` | ✓    | Update comment        |
| DELETE | `/api/posts/:id/comments/:id` | ✓    | Delete comment        |

---

## CI/CD

GitHub Actions runs on every push to `main` and every pull request:

1. **Backend tests** – all 39 pass
2. **Frontend tests** – all 29 pass
3. **Build** – TypeScript + Vite bundling succeeds

View workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

**Local test before pushing:**

```bash
npm test && cd client && npm test && npm run build && cd ..
```

---

## Troubleshooting

- Missing required env vars: ensure root `.env` contains valid `MONGO_URI` and `JWT_SECRET`.
- Mongo connection fails: verify URI format, credentials, IP allowlist, and that the cluster/local server is reachable.
- Port already in use: set `PORT` in `.env` for API and/or stop processes using ports `5000` and `5173`.

---

## License

ISC
