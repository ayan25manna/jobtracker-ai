# JobTracker AI — Complete End-to-End Guide 🚀

> Everything you need to understand, run, extend, and debug this project from zero to production.

---

## Table of Contents

1. [What This App Does](#1-what-this-app-does)
2. [Tech Stack — Why Each Tool](#2-tech-stack--why-each-tool)
3. [Project Structure Explained](#3-project-structure-explained)
4. [How the Code Is Organized (Architecture)](#4-how-the-code-is-organized-architecture)
5. [Data Models](#5-data-models)
6. [Authentication Flow — Step by Step](#6-authentication-flow--step-by-step)
7. [API Reference — Every Endpoint](#7-api-reference--every-endpoint)
8. [AI Feature — How It Works Internally](#8-ai-feature--how-it-works-internally)
9. [Frontend Data Flow](#9-frontend-data-flow)
10. [Drag and Drop — How Cards Move](#10-drag-and-drop--how-cards-move)
11. [Environment Variables Guide](#11-environment-variables-guide)
12. [Installation and Running](#12-installation-and-running)
13. [Common Errors and Fixes](#13-common-errors-and-fixes)
14. [How to Extend This Project](#14-how-to-extend-this-project)
15. [Commit Strategy](#15-commit-strategy)

---

## 1. What This App Does

JobTracker AI is a **Kanban-style job application tracker** with AI built in.

### The user journey:
```
Register/Login → Empty Kanban Board → Click "Add Application"
  → Paste job description → Click "Parse with AI"
    → AI extracts: company, role, skills, location, seniority, salary
    → AI generates 4 tailored resume bullet points
  → Save → Card appears in "Applied" column
→ Drag card to "Phone Screen" after recruiter calls
→ Drag to "Interview" → "Offer" → celebrate 🎉
→ Or drag to "Rejected" → cry briefly → apply again
```

### What makes it different from a spreadsheet:
- **AI does the data entry** — paste JD, fields auto-fill
- **Resume bullets on demand** — tailored to each specific role
- **Visual pipeline** — see your entire job hunt at a glance
- **Stale alerts** — orange border if you applied 14+ days ago with no update

---

## 2. Tech Stack — Why Each Tool

| Tool | What It Does | Why This One |
|------|-------------|--------------|
| **React 18** | UI rendering | Component model, hooks, huge ecosystem |
| **TypeScript** | Type safety across entire codebase | Catches bugs at compile time, great DX |
| **Vite** | Frontend build tool | Instant HMR, much faster than CRA |
| **Tailwind CSS** | Styling | Utility classes, no CSS file mess, dark mode built-in |
| **TanStack React Query v5** | Server state management | Caching, loading/error states, auto-refetch |
| **Zustand** | Client state (auth) | Tiny, simple, persist middleware built-in |
| **React Hook Form** | Form handling | Minimal re-renders, built-in validation |
| **@hello-pangea/dnd** | Drag and drop | Maintained fork of react-beautiful-dnd |
| **react-hot-toast** | Toast notifications | Lightweight, beautiful, accessible |
| **Node.js + Express** | Backend server | Fast, flexible, TypeScript support |
| **MongoDB + Mongoose** | Database | Flexible schema, great for JS/TS, free Atlas tier |
| **JWT + bcrypt** | Authentication | Stateless auth, industry standard |
| **Google Gemini 1.5 Flash** | AI parsing + bullets | **100% free tier**, JSON mode, fast, no credit card |
| **Zod** | Runtime validation | Validates Gemini JSON responses before trusting them |
| **axios** | HTTP client | Interceptors for JWT injection and 401 handling |

---

## 3. Project Structure Explained

```
jobtracker/
│
├── README.md                        ← You are here
├── .gitignore                       ← Excludes node_modules, .env, dist
│
├── client/                          ← Everything the browser runs
│   ├── index.html                   ← Single HTML file (Vite entry)
│   ├── vite.config.ts               ← Vite + path alias + dev proxy to :5000
│   ├── tailwind.config.js           ← Custom colors, animations, dark mode
│   ├── postcss.config.js            ← Required by Tailwind
│   ├── tsconfig.json                ← Strict TypeScript config
│   ├── package.json                 ← Frontend dependencies
│   └── src/
│       ├── main.tsx                 ← App entry: mounts React, applies dark mode
│       ├── App.tsx                  ← Router + QueryClient + Toaster
│       ├── index.css                ← Tailwind imports + reusable CSS classes
│       │
│       ├── types/index.ts           ← ALL shared TypeScript interfaces
│       │
│       ├── store/
│       │   └── authStore.ts         ← Zustand store: token + user, persisted
│       │
│       ├── api/
│       │   ├── axios.ts             ← Axios instance, JWT interceptor, 401 handler
│       │   └── index.ts             ← All API functions (authApi, applicationsApi, aiApi)
│       │
│       ├── hooks/
│       │   ├── useAuth.ts           ← Login/register mutations, logout
│       │   └── useApplications.ts   ← CRUD queries/mutations, parse, suggest
│       │
│       ├── pages/
│       │   ├── LoginPage.tsx        ← Login form
│       │   ├── RegisterPage.tsx     ← Register form
│       │   └── BoardPage.tsx        ← Main Kanban board view
│       │
│       └── components/
│           ├── Navbar.tsx           ← Top bar: search, add button, dark mode, user
│           ├── ProtectedRoute.tsx   ← Redirects to /login if no token
│           │
│           ├── ui/index.tsx         ← Reusable: Spinner, Badge, Modal, TabBar, etc.
│           │
│           ├── board/
│           │   ├── StatsBar.tsx     ← Count cards per column + offer rate
│           │   ├── KanbanColumn.tsx ← One column (Droppable zone)
│           │   └── AppCard.tsx      ← One card (Draggable item)
│           │
│           └── modals/
│               ├── AppModal.tsx     ← Create/Edit modal with AI parse + bullets tabs
│               └── DetailModal.tsx ← Read-only detail view with edit button
│
└── server/                          ← Everything that runs on the server
    ├── package.json                 ← Backend dependencies
    ├── tsconfig.json                ← Backend TypeScript config
    ├── .env.example                 ← Template for your .env file
    └── src/
        ├── index.ts                 ← Express app setup, DB connect, listen
        │
        ├── types/index.ts           ← Server-side types: JwtPayload, ParsedJob
        │
        ├── models/
        │   ├── User.ts              ← Mongoose schema: email, hashed password
        │   └── Application.ts       ← Mongoose schema: all 12 application fields
        │
        ├── middleware/
        │   ├── auth.ts              ← verifyJWT — reads Bearer token, sets req.user
        │   └── errorHandler.ts      ← Global error catcher, createError() helper
        │
        ├── services/                ← BUSINESS LOGIC LIVES HERE, not in routes
        │   ├── authService.ts       ← register(), login() — bcrypt + JWT signing
        │   ├── applicationService.ts← CRUD operations with ownership checks
        │   └── aiService.ts         ← parseJobDescription(), generateResumeSuggestions()
        │
        ├── controllers/             ← THIN — validate input, call service, respond
        │   ├── auth.controller.ts
        │   ├── application.controller.ts
        │   └── ai.controller.ts
        │
        └── routes/                  ← Wire URL paths to controller functions
            ├── auth.routes.ts       ← /api/auth/*
            ├── application.routes.ts← /api/applications/*
            └── ai.routes.ts         ← /api/ai/*
```

---

## 4. How the Code Is Organized (Architecture)

### The Golden Rule: Each layer talks only to the layer below it

```
Browser (React)
    ↕  HTTP (JSON)
Routes  ← just maps URLs to controllers
    ↕
Controllers ← validates req, calls service, sends res
    ↕
Services ← all business logic, all AI calls, all DB calls
    ↕
Models (Mongoose) / External APIs (Gemini)
    ↕
MongoDB / Gemini servers
```

### Why this separation matters:

**Bad (everything in route handler):**
```typescript
// ❌ DON'T — route handler doing everything
router.post('/ai/parse', verifyJWT, async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.GEMINI_API_KEY }); // wrong
  const result = await openai.chat.completions.create({...}); // wrong
  const parsed = JSON.parse(result.choices[0].message.content); // no validation
  res.json(parsed); // could crash on bad AI output
});
```

**Good (this project's approach):**
```typescript
// ✅ DO — controller is thin
export async function parse(req, res, next) {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription?.trim()) throw createError('Paste a JD first.', 400);
    const result = await parseJobDescription(jobDescription); // service call
    res.json(result);
  } catch (err) { next(err); }
}

// ✅ All logic in aiService.ts — testable, reusable, isolated
export async function parseJobDescription(jd: string): Promise<ParsedJob> {
  const client = getClient();
  const completion = await client.chat.completions.create({...});
  const raw = completion.choices[0]?.message?.content ?? '{}';
  return ParsedJobSchema.parse(JSON.parse(raw)); // Zod validates
}
```

---

## 5. Data Models

### User (`server/src/models/User.ts`)

```typescript
{
  _id: ObjectId,          // MongoDB auto-generated ID
  email: string,          // unique, lowercase, validated format
  password: string,       // bcrypt hash — NEVER store plain text
  createdAt: Date,        // auto by timestamps: true
  updatedAt: Date,        // auto by timestamps: true
}
```

**Important:** The `pre('save')` hook automatically hashes the password before it ever reaches MongoDB:
```typescript
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // don't re-hash on other updates
  this.password = await bcrypt.hash(this.password, 12); // 12 salt rounds
  next();
});
```

### Application (`server/src/models/Application.ts`)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // ← references User._id (ownership)
  company: string,            // required
  role: string,               // required
  jdLink: string,             // optional URL to job posting
  notes: string,              // free text notes
  dateApplied: Date,          // defaults to now
  status: enum,               // 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected'
  salaryRange: string,        // e.g. "$150k–$200k"
  location: string,           // e.g. "Remote" or "New York"
  seniority: string,          // e.g. "Senior", "Mid"
  requiredSkills: string[],   // populated by AI or user
  niceToHaveSkills: string[], // populated by AI or user
  resumeSuggestions: string[],// AI-generated bullet points
  createdAt: Date,
  updatedAt: Date,
}
```

**Ownership check** — every query filters by `userId` so users can only see their own data:
```typescript
// applicationService.ts
return Application.find({ userId }); // always scoped to the logged-in user
```

---

## 6. Authentication Flow — Step by Step

### Registration

```
User fills form → POST /api/auth/register { email, password }
  → authController.register()
    → validates email + password not empty
    → authService.registerUser()
      → check if email already exists in DB → 409 if yes
      → User.create({ email, password })
        → pre-save hook: bcrypt.hash(password, 12)
        → saves { email, hashedPassword } to MongoDB
      → jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
      → return { token, user: { id, email } }
    → res.status(201).json({ token, user })
  → client receives token
    → useAuthStore.setAuth(token, user) — stored in localStorage via Zustand persist
    → navigate('/board')
```

### Login

```
User fills form → POST /api/auth/login { email, password }
  → authController.login()
    → authService.loginUser()
      → User.findOne({ email })
      → bcrypt.compare(plainPassword, user.password) — timing-safe comparison
      → if no match → 401 "Wrong credentials"
      → if match → sign new JWT → return { token, user }
    → res.status(200).json({ token, user })
  → same as registration from here
```

### Every protected request

```
Client makes any API call
  → axios interceptor reads useAuthStore.getState().token
  → adds header: Authorization: Bearer <token>
  → request hits Express

Express receives request on protected route
  → verifyJWT middleware runs first
  → reads req.headers.authorization
  → splits "Bearer <token>" → extracts token
  → jwt.verify(token, JWT_SECRET) → decodes { userId, email }
  → sets req.user = { userId, email }
  → calls next() → controller runs

If token is expired or invalid:
  → jwt.verify throws
  → middleware responds 401
  → axios response interceptor catches 401
  → calls useAuthStore.getState().clearAuth()
  → user is redirected to login
```

### Staying logged in after refresh

Zustand's `persist` middleware saves the auth store to `localStorage`. On app load:
```typescript
// authStore.ts — this runs automatically on import
persist(
  (set) => ({ token: null, user: null, setAuth, clearAuth }),
  { name: 'jobtracker-auth' } // localStorage key
)
```

```typescript
// main.tsx — dark mode applied before first paint
if (localStorage.getItem('jt-dark') === '1') {
  document.documentElement.classList.add('dark');
}
```

On page refresh, Zustand rehydrates from `localStorage`. The token is there → axios interceptor picks it up → first API call succeeds → user sees their board.

---

## 7. API Reference — Every Endpoint

### Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

### Auth Routes (`/api/auth`)

#### `POST /api/auth/register`
**Body:**
```json
{ "email": "dev@example.com", "password": "secret123" }
```
**Success 201:**
```json
{
  "message": "Account created! Go get those offers. 🚀",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { "id": "6789abcd...", "email": "dev@example.com" }
}
```
**Errors:** 400 missing fields, 409 email taken

---

#### `POST /api/auth/login`
**Body:** `{ "email": "...", "password": "..." }`
**Success 200:** Same shape as register
**Errors:** 400 missing fields, 401 wrong credentials

---

#### `GET /api/auth/me` 🔒
**Success 200:** `{ "user": { "userId": "...", "email": "..." } }`

---

### Application Routes (`/api/applications`) 🔒 All protected

#### `GET /api/applications`
Returns all applications for the logged-in user, sorted newest first.
```json
[
  {
    "_id": "6789...",
    "company": "Stripe",
    "role": "Senior Frontend Engineer",
    "status": "Interview",
    "dateApplied": "2025-03-15T00:00:00.000Z",
    "requiredSkills": ["React", "TypeScript"],
    "resumeSuggestions": ["Led migration of...", "..."],
    ...
  }
]
```

---

#### `POST /api/applications`
**Body:** Any fields from the Application schema (company + role required)
```json
{
  "company": "Google",
  "role": "Staff Engineer",
  "status": "Applied",
  "dateApplied": "2025-04-01",
  "requiredSkills": ["Go", "Kubernetes"],
  "salaryRange": "$250k+"
}
```
**Success 201:** The created Application object

---

#### `PATCH /api/applications/:id`
Update any fields. Used for drag-and-drop (just sends `{ "status": "Interview" }`) and full edits.
**Success 200:** The updated Application object
**Errors:** 400 invalid ID, 404 not found or not owned by user

---

#### `DELETE /api/applications/:id`
**Success 200:** `{ "message": "Application deleted. Onward! 💨" }`
**Errors:** 400, 404

---

### AI Routes (`/api/ai`) 🔒 All protected

#### `POST /api/ai/parse`
**Body:** `{ "jobDescription": "We are looking for a Senior React Engineer..." }`
**Success 200:**
```json
{
  "company": "Acme Corp",
  "role": "Senior React Engineer",
  "seniority": "Senior",
  "location": "Remote",
  "requiredSkills": ["React", "TypeScript", "GraphQL"],
  "niceToHaveSkills": ["Docker", "AWS"],
  "salaryRange": "$160k–$200k"
}
```
**Errors:** 400 empty body, 422 AI returned unexpected format, 500 no API key

---

#### `POST /api/ai/suggest`
**Body:** A `ParsedJob` object (output of /parse)
```json
{
  "company": "Acme Corp",
  "role": "Senior React Engineer",
  "seniority": "Senior",
  "requiredSkills": ["React", "TypeScript", "GraphQL"]
}
```
**Success 200:**
```json
{
  "bullets": [
    "Architected React component library used by 12 product teams, reducing UI development time by 35%",
    "Led TypeScript migration of 80,000-line codebase, eliminating 200+ runtime type errors in production",
    "Built GraphQL subscription layer enabling real-time dashboard updates for 50,000 daily active users",
    "Mentored 4 junior engineers on React performance patterns, improving Lighthouse scores from 62 to 94"
  ]
}
```

---

## 8. AI Feature — How It Works Internally

### Which AI? Google Gemini 1.5 Flash — completely free

This project uses **Google Gemini 1.5 Flash** instead of OpenAI. Here's why:

| | Google Gemini 1.5 Flash | OpenAI GPT-4o-mini |
|--|--|--|
| Price | **Free** (15 RPM, 1M TPM/day) | Paid (requires credit card) |
| Credit card needed | ❌ No | ✅ Yes |
| JSON mode | ✅ Yes (schema-enforced) | ✅ Yes |
| Quality | Excellent for structured extraction | Excellent |
| Get key | https://aistudio.google.com | https://platform.openai.com |

**Free tier limits (more than enough for this project):**
- 15 requests per minute
- 1 million tokens per day
- No billing setup needed

---

### The Two Gemini Calls

Every time a user clicks "Parse with AI", two sequential API calls happen:

```
User clicks "Parse with AI"
  → frontend calls POST /api/ai/parse
  → aiService.parseJobDescription(jd)
    → Gemini call #1: Extract structured data (JSON schema enforced)
    → Returns ParsedJob to frontend
  → frontend fills form fields
  → frontend calls POST /api/ai/suggest
  → aiService.generateResumeSuggestions(parsedJob)
    → Gemini call #2: Generate bullets (JSON schema enforced)
    → Returns bullets to frontend
  → frontend shows bullets in Bullets tab
```

---

### Schema-Enforced JSON — Better Than Prompt Engineering

Gemini's `responseSchema` forces the model to return **exactly** the shape you define — no markdown, no extra keys, no surprises:

```typescript
const model = client.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',   // forces JSON output
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        company:          { type: SchemaType.STRING },
        role:             { type: SchemaType.STRING },
        requiredSkills:   { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        // ... etc
      },
      required: ['company', 'role', 'requiredSkills', ...],
    },
  },
});
```

The model is structurally constrained — it **cannot** return anything that doesn't match this schema. This is safer than JSON mode in OpenAI, which only ensures valid JSON but not a specific shape.

---

### The Prompts

**For parsing (call #1):**
```
You are a job description parser.
Extract the following from the job description below and return as JSON:
- company: company name (empty string if not found)
- role: exact job title
- seniority: Junior / Mid / Senior / Staff / Principal (infer if not stated)
- location: city, Remote, or Hybrid
- requiredSkills: array of must-have technical skills
- niceToHaveSkills: array of preferred/optional skills
- salaryRange: salary range string (empty string if not mentioned)

Job description:
[first 6000 chars of JD]
```

**For bullets (call #2):**
```
You are an expert resume coach. Generate exactly 4 strong resume bullet points
tailored specifically for this job role. Return as JSON with a "bullets" array.

Rules:
- Start every bullet with a strong action verb
- Include realistic metrics
- Reference the specific skills listed below
- Never start with "Worked on" or "Responsible for"

Role: Senior Frontend Engineer
Required skills: React, TypeScript, GraphQL
[etc]
```

---

### Cost

**Zero.** The free tier gives you 15 requests/minute and 1 million tokens/day. Each "Add Application" uses 2 requests and ~1,000 tokens total. You'd need to add 500 applications per day before hitting the daily limit.

---

### Error handling

Even with schema enforcement, the JSON parse can still fail on edge cases. The `try/catch` in `aiService.ts` converts any failure into a clean 422 error that the frontend shows as a toast:

```typescript
try {
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const parsed = JSON.parse(raw) as ParsedJob;
  parsed.requiredSkills   = parsed.requiredSkills   ?? []; // defensive defaults
  parsed.niceToHaveSkills = parsed.niceToHaveSkills ?? [];
  return parsed;
} catch {
  throw createError('AI returned something unexpected. Try again! 💭', 422);
}
```

---

## 9. Frontend Data Flow

### React Query as the single source of truth

```
MongoDB
  ↑↓ (Mongoose)
Express API
  ↑↓ (HTTP / axios)
React Query Cache  ←← THIS is what components read from
  ↑↓
React Components
```

React Query keeps a client-side cache of `['applications']`. Every component reads from this cache — not directly from the server on every render.

### How a new application card appears instantly (optimistic update)

```typescript
// useApplications.ts
export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => applicationsApi.create(data),
    onSuccess: (res) => {
      // Update cache BEFORE server confirms — instant UI update
      qc.setQueryData<Application[]>(['applications'], (old) =>
        old ? [res.data, ...old] : [res.data]
      );
    },
  });
}
```

### How drag-and-drop updates the backend

```typescript
// BoardPage.tsx
function onDragEnd(result: DropResult) {
  const newStatus = result.destination.droppableId as ApplicationStatus;
  const app = apps.find((a) => a._id === result.draggableId);
  if (app.status === newStatus) return; // no change, skip

  // This updates cache + fires PATCH in background
  updateApp.mutate({ id: result.draggableId, data: { status: newStatus } });
}
```

The `useUpdateApplication` hook updates the cache immediately then sends the PATCH. If the PATCH fails, React Query can roll back.

### Component re-render flow

```
User drags card
  → onDragEnd fires
  → updateApp.mutate({ id, status })
  → React Query updates cache for ['applications']
  → ALL components subscribed to ['applications'] re-render
  → BoardPage re-filters apps by status (useMemo)
  → KanbanColumn receives new apps array
  → AppCard moves to new column visually
  → PATCH /api/applications/:id fires in background
  → Server confirms → cache already correct, no extra re-render
```

---

## 10. Drag and Drop — How Cards Move

This project uses `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd).

### Three concepts:

**DragDropContext** — wraps the whole board, receives `onDragEnd`
```tsx
<DragDropContext onDragEnd={onDragEnd}>
  {/* all columns go here */}
</DragDropContext>
```

**Droppable** — a zone that can receive dragged items (one per column)
```tsx
<Droppable droppableId="Interview">  {/* must match ApplicationStatus */}
  {(provided) => (
    <div ref={provided.innerRef} {...provided.droppableProps}>
      {/* cards */}
      {provided.placeholder}  {/* keeps space while dragging */}
    </div>
  )}
</Droppable>
```

**Draggable** — a card that can be picked up
```tsx
<Draggable draggableId={app._id} index={index}>
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={snapshot.isDragging ? 'ring-2 ring-brand-400' : ''}
    >
      {/* card content */}
    </div>
  )}
</Draggable>
```

### What happens on drop:

```typescript
function onDragEnd(result: DropResult) {
  const { destination, draggableId } = result;

  // Dropped outside a column — do nothing
  if (!destination) return;

  // Dropped in same column — do nothing
  const newStatus = destination.droppableId as ApplicationStatus;
  const app = apps.find((a) => a._id === draggableId);
  if (!app || app.status === newStatus) return;

  // Fire PATCH to update status in MongoDB
  updateApp.mutate({ id: draggableId, data: { status: newStatus } });
}
```

---

## 11. Environment Variables Guide

### Server `.env` (create at `server/.env`)

```env
# Which port Express listens on
PORT=5000

# MongoDB connection string
# Local: mongodb://localhost:27017/jobtracker
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/jobtracker
MONGODB_URI=mongodb://localhost:27017/jobtracker

# Secret for signing JWTs — must be long and random in production
# Generate one: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=change_this_to_something_very_long_and_random

# How long tokens stay valid
JWT_EXPIRES_IN=7d

# FREE — Get at https://aistudio.google.com/app/apikey (no credit card required)
GEMINI_API_KEY=AIza...

# The URL of your frontend — used for CORS
CLIENT_URL=http://localhost:5173
```

### Client `.env` (optional — Vite proxy handles dev automatically)

```env
# Only needed if deploying separately from the server
VITE_API_BASE_URL=http://localhost:5000
```

### How Vite proxy works in development

`vite.config.ts` has:
```typescript
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

So `axios.get('/api/applications')` from the browser actually goes to `http://localhost:5000/api/applications`. No CORS issues in development.

---

## 12. Installation and Running

### Prerequisites

- Node.js 18 or higher: `node --version`
- npm 9+: `npm --version`
- MongoDB running locally OR a free MongoDB Atlas account

### Step 1 — Get MongoDB running

**Option A: Local MongoDB (macOS)**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Option B: Local MongoDB (Windows)**
Download from https://www.mongodb.com/try/download/community, install, start the service.

**Option C: MongoDB Atlas (cloud, free tier)**
1. Go to https://cloud.mongodb.com
2. Create free account → Create cluster (free M0 tier)
3. Add database user → Get connection string
4. Replace `MONGODB_URI` in `.env` with your connection string

### Step 2 — Clone and install

```bash
# Unzip the project
unzip jobtracker-ai.zip
cd jobtracker

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3 — Configure environment

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string (min 32 chars)
- `GEMINI_API_KEY` — your free Gemini key from https://aistudio.google.com/app/apikey

### Step 4 — Run the servers

Open **two terminal windows:**

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
You should see:
```
🍃 MongoDB connected
🚀 Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:5173/
```

### Step 5 — Open the app

Visit http://localhost:5173

1. Click "Create one free" to register
2. Log in
3. Click "+ Add Application"
4. Go to "AI Parse" tab, paste a job description, click "Parse with AI"
5. Drag cards between columns

### Build for production

```bash
# Build frontend
cd client && npm run build   # outputs to client/dist/

# Build backend
cd server && npm run build   # outputs to server/dist/

# Run production backend (serve frontend statically or separately)
cd server && npm start
```

---

## 13. Common Errors and Fixes

### ❌ `MongoServerError: connect ECONNREFUSED`
MongoDB isn't running.
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas and update MONGODB_URI
```

### ❌ `Error: Gemini API key not configured`
You haven't added `GEMINI_API_KEY` to `server/.env`.
1. Get a free key at https://aistudio.google.com/app/apikey (sign in with Google, no card)
2. Add `GEMINI_API_KEY=AIza...` to `server/.env`
3. Restart the server (`Ctrl+C` then `npm run dev`)

### ❌ `JWT_SECRET is not set`
Add `JWT_SECRET=anything_long_and_random` to `server/.env`

### ❌ Frontend shows "Could not load your applications. Is the server running?"
- Check Terminal 1 — is the server running on :5000?
- Check `server/.env` — is `MONGODB_URI` correct?
- Try: `curl http://localhost:5000/api/health` — should return `{"status":"ok"}`

### ❌ `CORS error` in browser console
Ensure `CLIENT_URL=http://localhost:5173` is in `server/.env`. Restart the server.

### ❌ TypeScript errors on `npm run dev`
```bash
# Make sure you're in the right directory
cd client && npm run dev    # for client
cd server && npm run dev    # for server
```

### ❌ AI returns empty skills / wrong data
- The JD might be too short. Paste the full description.
- Gemini quota hit (15 req/min free limit) — wait 60 seconds and retry
- Model returned unexpected JSON — Zod catches this, you'll see a 422 error toast

### ❌ Cards don't drag
The DnD library requires the draggable and droppable IDs to match exactly. The `droppableId` must equal the `ApplicationStatus` string (e.g., `"Phone Screen"` not `"phone-screen"`).

---

## 14. How to Extend This Project

### Add a new field to Application cards

1. **Model** (`server/src/models/Application.ts`): Add field to schema
2. **Types** (`client/src/types/index.ts`): Add to `Application` and `CreateApplicationInput`
3. **Modal** (`client/src/components/modals/AppModal.tsx`): Add input field
4. **Card** (`client/src/components/board/AppCard.tsx`): Display it if wanted
5. **AI parse** (optional): Add to the ParsedJobSchema in `aiService.ts` and the system prompt

### Add CSV export (stretch goal)

```bash
cd client && npm install papaparse @types/papaparse
```

```typescript
// In BoardPage.tsx or a new ExportButton.tsx
import Papa from 'papaparse';

function exportCSV(apps: Application[]) {
  const csv = Papa.unparse(apps.map(a => ({
    Company: a.company,
    Role: a.role,
    Status: a.status,
    Applied: new Date(a.dateApplied).toLocaleDateString(),
    Salary: a.salaryRange,
    Location: a.location,
  })));
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'applications.csv'; a.click();
}
```

### Add streaming AI responses (stretch goal)

In `aiService.ts`, change `create()` to `stream: true` and pipe the response through an SSE endpoint. On the frontend, use `EventSource` on the client to consume the stream.

### Add follow-up reminders

In `AppCard.tsx` the stale detection already exists:
```typescript
const daysAgo = Math.floor((Date.now() - new Date(app.dateApplied).getTime()) / 86_400_000);
const isStale = daysAgo > 14 && app.status === 'Applied';
```
Extend this to send email reminders by adding a cron job in the server using `node-cron` + `nodemailer`.

### Add a dashboard page

Create `client/src/pages/DashboardPage.tsx` with a chart using `recharts`:
```bash
cd client && npm install recharts
```
Add a route in `App.tsx` and a nav link in `Navbar.tsx`.

---

## 15. Commit Strategy

Good commits tell the story of how the project was built. Each commit should do **one logical thing**.

### Recommended commit sequence for this project:

```bash
git init
git add .gitignore && git commit -m "chore: init repo with gitignore"

# Server
git add server/src/models/ && git commit -m "feat: add User and Application mongoose models"
git add server/src/middleware/ && git commit -m "feat: add JWT auth middleware and error handler"
git add server/src/services/authService.ts && git commit -m "feat: authService register and login with bcrypt"
git add server/src/services/applicationService.ts && git commit -m "feat: applicationService CRUD with ownership checks"
git add server/src/services/aiService.ts && git commit -m "feat: AIService parseJD and generateBullets with Zod validation"
git add server/src/controllers/ server/src/routes/ server/src/index.ts && git commit -m "feat: wire controllers and routes into Express app"

# Client
git add client/src/types/ client/src/store/ && git commit -m "feat: shared types and Zustand auth store"
git add client/src/api/ && git commit -m "feat: axios instance with JWT interceptor and API functions"
git add client/src/hooks/ && git commit -m "feat: React Query hooks for applications and auth"
git add client/src/pages/LoginPage.tsx client/src/pages/RegisterPage.tsx && git commit -m "feat: login and register pages"
git add client/src/components/board/ && git commit -m "feat: KanbanColumn and AppCard with drag and drop"
git add client/src/components/modals/ && git commit -m "feat: AppModal with AI parse tab and DetailModal"
git add client/src/pages/BoardPage.tsx && git commit -m "feat: board page with DnD, search, and empty states"
git add client/src/components/Navbar.tsx && git commit -m "feat: navbar with search, dark mode, and user menu"
```

### Commit message format:

```
<type>: <short description>

Types:
  feat     — new feature
  fix      — bug fix
  chore    — tooling, config, deps
  style    — formatting, CSS only
  refactor — code restructure, no behavior change
  docs     — README, comments only
  test     — adding tests
```

---

## Quick Reference Card

```
START SERVERS:
  Terminal 1: cd server && npm run dev    → :5000
  Terminal 2: cd client && npm run dev    → :5173

KEY FILES:
  AI logic:          server/src/services/aiService.ts
  Auth logic:        server/src/services/authService.ts
  JWT middleware:    server/src/middleware/auth.ts
  All API calls:     client/src/api/index.ts
  React Query hooks: client/src/hooks/useApplications.ts
  Auth store:        client/src/store/authStore.ts
  Board page:        client/src/pages/BoardPage.tsx
  Add/Edit modal:    client/src/components/modals/AppModal.tsx
  Shared types:      client/src/types/index.ts (client)
                     server/src/types/index.ts (server)

API BASE: http://localhost:5000/api
  POST /auth/register       — create account
  POST /auth/login          — get token
  GET  /applications        — list all (JWT required)
  POST /applications        — create (JWT required)
  PATCH /applications/:id   — update/drag (JWT required)
  DELETE /applications/:id  — delete (JWT required)
  POST /ai/parse            — extract JD data (JWT required)
  POST /ai/suggest          — generate bullets (JWT required)

HEALTH CHECK: curl http://localhost:5000/api/health
```
