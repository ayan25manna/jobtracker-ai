# JobTracker AI 🚀

> Track every job application on a beautiful Kanban board. AI parses job descriptions and generates tailored resume bullets — so you can spend less time formatting and more time interviewing.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Tailwind CSS, Vite |
| State | TanStack React Query v5, Zustand |
| Forms | React Hook Form |
| DnD | @hello-pangea/dnd |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| AI | OpenAI GPT-4o-mini (JSON mode) |

---

## Project Structure

```
jobtracker/
├── client/                  # Vite + React frontend
│   └── src/
│       ├── api/             # axios instance + typed API functions
│       ├── components/
│       │   ├── board/       # KanbanColumn, AppCard, StatsBar
│       │   ├── modals/      # AppModal (create/edit + AI), DetailModal
│       │   ├── ui/          # Spinner, Badge, Modal, TabBar, etc.
│       │   ├── Navbar.tsx
│       │   └── ProtectedRoute.tsx
│       ├── hooks/           # useApplications, useAuth
│       ├── pages/           # LoginPage, RegisterPage, BoardPage
│       ├── store/           # Zustand auth store (persisted)
│       └── types/           # Shared TypeScript interfaces
│
└── server/                  # Express backend
    └── src/
        ├── controllers/     # Thin handlers — call service, return response
        ├── middleware/       # verifyJWT, errorHandler
        ├── models/          # User, Application (Mongoose)
        ├── routes/          # auth, applications, ai
        ├── services/        # authService, applicationService, aiService ← AI lives here
        └── types/           # JwtPayload, ParsedJob, etc.
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- OpenAI API key

### 2. Clone & install

```bash
git clone <repo-url>
cd jobtracker

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 3. Configure environment variables

**Server** — copy and fill in:
```bash
cd server
cp .env.example .env
```

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...your-key-here...
CLIENT_URL=http://localhost:5173
```

**Client** — (optional, Vite proxy handles this automatically in dev):
```bash
cd client
cp .env.example .env
```

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API health check: http://localhost:5000/api/health

---

## Features

### Authentication
- Register / login with email + password
- JWT stored in Zustand (persisted to localStorage)
- All API routes protected — auto-logout on token expiry
- `ProtectedRoute` wrapper redirects unauthenticated users to login

### Kanban Board
- Five columns: **Applied → Phone Screen → Interview → Offer → Rejected**
- Drag and drop cards between columns (persisted instantly via PATCH)
- Search/filter across all columns in real time
- Stale application highlights (orange border if Applied for 14+ days)
- Stats bar showing counts per stage + offer rate

### AI Job Description Parser
- Paste any job posting → click **Parse with AI**
- Calls `POST /api/ai/parse` → `aiService.parseJobDescription()`
- Extracts: company, role, seniority, location, required skills, nice-to-haves, salary
- Auto-fills all form fields
- Immediately generates 4 tailored resume bullets
- AI logic is entirely in `server/src/services/aiService.ts` — never in route handlers

### Resume Bullet Suggestions
- 4 AI-generated bullets per role, specific to the skills listed
- Regenerate button to get fresh suggestions
- Per-bullet copy button with visual confirmation

### Application Management
- Create, view, edit, delete
- Fields: company, role, JD link, notes, date, status, salary, location, seniority, skills
- Detail view modal with all info at a glance
- Toast notifications on every action

---

## API Reference

### Auth
```
POST /api/auth/register   { email, password }
POST /api/auth/login      { email, password }
GET  /api/auth/me         (protected)
```

### Applications (all protected)
```
GET    /api/applications
POST   /api/applications      { company, role, ... }
PATCH  /api/applications/:id  { status, ... }
DELETE /api/applications/:id
```

### AI (all protected)
```
POST /api/ai/parse    { jobDescription: string } → ParsedJob
POST /api/ai/suggest  ParsedJob → { bullets: string[] }
```

---

## Design Decisions

- **AI in service layer**: `aiService.ts` owns all OpenAI calls. Controllers are thin — they validate input, call the service, return the response. No AI logic in route handlers.
- **Zod validation**: Every OpenAI JSON response is validated with Zod before being returned. Bad AI output → 422 with a clear error, not a crash.
- **Optimistic DnD**: Dragging a card updates the UI immediately, then fires a PATCH in the background.
- **React Query**: All server state via `useQuery` / `useMutation`. Automatic cache invalidation, loading/error states, and background refetching.
- **No `any`**: TypeScript strict mode throughout. `eslint-disable` comments require justification.

---

## Stretch Goals (not yet implemented)

- [ ] Streaming AI responses
- [ ] Follow-up reminders with overdue highlights
- [ ] Export to CSV
- [ ] Dashboard with charts
- [ ] Email notifications

---

## Commit Convention

```
feat: add drag-and-drop between columns
feat: AIService.parseJobDescription with Zod validation  
fix: handle empty OpenAI response gracefully
chore: add JWT middleware
style: improve kanban column empty state
```
