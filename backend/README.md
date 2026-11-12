# LegalDost — Backend API

Node.js, Express, and TypeScript backend for the **LegalDost** platform, serving both the **Admin Panel** (`http://localhost:3000`) and the **Lawyer Web Panel** (`http://localhost:3001`), as well as the future **Customer Mobile Application**.

---

## 1. Architecture Overview

- **Runtime**: Node.js v20+ / v22+
- **Server**: Express.js 5
- **Database**: MongoDB Atlas via Mongoose
- **Security**: Helmet, Rate Limiting, CORS with multi-origin support, HttpOnly secure cookies, bcrypt password hashing.
- **Validation**: Zod request schema validation.

---

## 2. API Endpoints

### Admin & Platform Routes (`/api/v1`)

- `POST /api/v1/auth/login` — Admin login (HttpOnly cookie)
- `POST /api/v1/auth/logout` — Admin logout
- `GET /api/v1/auth/me` — Authenticated admin session info
- `GET /api/v1/admin/dashboard` — Platform overview metrics & recent activity
- `GET /api/v1/lawyers` — Filtered & paginated lawyers list
- `POST /api/v1/lawyers` — Add new lawyer profile
- `GET /api/v1/lawyers/:id` — Lawyer detailed record
- `PUT /api/v1/lawyers/:id` — Update lawyer profile
- `PATCH /api/v1/lawyers/:id/status` — Update account status (`active`, `suspended`, `inactive`)
- `PATCH /api/v1/lawyers/:id/verification` — Update Bar verification status (`under_review`, `verified`, `rejected`)
- `DELETE /api/v1/lawyers/:id` — Soft-delete lawyer record

### Lawyer Web Panel Routes (`/api/v1/lawyer`)

- `POST /api/v1/lawyer/auth/login` — Advocate login
- `POST /api/v1/lawyer/auth/register` — Advocate registration & verification onboarding
- `POST /api/v1/lawyer/auth/logout` — Advocate logout
- `GET /api/v1/lawyer/auth/me` — Authenticated lawyer profile
- `GET /api/v1/lawyer/dashboard/stats` — Operational dashboard metrics
- `GET /api/v1/lawyer/queries` — Incoming queries list
- `GET /api/v1/lawyer/queries/:id` — Query details & AI intake summary
- `POST /api/v1/lawyer/queries/:id/accept` — Atomic concurrency-safe query acceptance
- `POST /api/v1/lawyer/queries/:id/decline` — Query decline with mandatory reason
- `GET /api/v1/lawyer/matters` — Matters docket list
- `GET /api/v1/lawyer/matters/:id` — Complete legal matter workspace
- `POST /api/v1/lawyer/matters/:id/internal-notes` — Private internal counsel notes (strict privacy)
- `POST /api/v1/lawyer/matters/:id/client-updates` — Client-facing timeline updates
- `POST /api/v1/lawyer/matters/:id/tasks` — Matter tasks & deadlines
- `PATCH /api/v1/lawyer/matters/:id/tasks/:taskId` — Toggle task completion
- `PATCH /api/v1/lawyer/matters/:id/status` — Update matter lifecycle stage
- `GET /api/v1/lawyer/documents` — Case evidence and documents repository
- `POST /api/v1/lawyer/documents/:id/review` — Counsel document review verdict & notes
- `GET /api/v1/lawyer/conversations` — Active client chat channels
- `GET /api/v1/lawyer/conversations/:id/messages` — Conversation message history
- `POST /api/v1/lawyer/conversations/:id/messages` — Send advisory message
- `PATCH /api/v1/lawyer/conversations/:id/read` — Mark conversation as read
- `GET /api/v1/lawyer/consultations` — Scheduled consultations list
- `POST /api/v1/lawyer/consultations/:id/accept` — Accept consultation & set meeting link
- `POST /api/v1/lawyer/consultations/:id/decline` — Decline consultation with reason
- `PATCH /api/v1/lawyer/consultations/:id/status` — Mark consultation completed / cancelled
- `GET /api/v1/lawyer/notifications` — In-app notification feed
- `PATCH /api/v1/lawyer/notifications/:id/read` — Mark notification read
- `PATCH /api/v1/lawyer/notifications/read-all` — Mark all notifications read
- `PATCH /api/v1/lawyer/profile` — Update editable advocate profile details & fees

---

## 3. Environment Configuration

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/legaldost?retryWrites=true&w=majority
JWT_SECRET=supersecretlegaldostjwtkeychangeinproduction12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

---

## 4. Setup & Running

```bash
cd backend
npm install
npm run build
npm start
```

For development with hot-reload:
```bash
npm run dev
```

For seeding initial admin and sample data:
```bash
npm run seed
```

