# Developer Portal

An extensible API documentation and sandbox platform for external developers. Browse OpenAPI-driven docs, run live sandbox requests, manage API keys, and view analytics — all from a single portal.

## Features

- **Authentication** — Sign up, sign in, and sign out via Supabase Auth with protected routes and session persistence
- **API catalogue & docs** — Sidebar driven by a central registry; endpoint views rendered entirely from OpenAPI specs
- **Interactive sandbox** — Live HTTP requests with formatted responses, status badges, latency, and cURL / fetch / Python snippets
- **API key management** — Create, list (masked), and revoke keys per environment
- **Analytics dashboard** — Per-key usage metrics with charts (mocked data)
- **Status page** — Per-API health, uptime, and incident feed (mocked data)
- **Changelog** — Versioned entries per API with filters
- **Command palette** — Full-text endpoint search via `Ctrl+K` / `Cmd+K`
- **Guest access** — Browse docs and use the sandbox without creating an account (`Continue as guest` on the login page)

## Tech stack

- React 19 + TypeScript (strict)
- Vite 8
- TanStack Query & React Router
- Tailwind CSS v4
- Supabase Auth
- Zustand (local UI state)
- Recharts (analytics)

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm 10+
- A [Supabase](https://supabase.com/) project (optional for guest access; required for sign-up / sign-in)

## Getting started

```bash
git clone <repository-url>
cd developer-portal
npm ci
cp .env.example .env   # optional — only needed for sign-in / sign-up
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port Vite prints in the terminal).

**No `.env`?** The app still runs. On `/login`, click **Continue as guest** to explore the portal. Add Supabase credentials to `.env` when you want to test authentication.

## Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find both values in the Supabase dashboard.

## Authentication

**Provider:** [Supabase Auth](https://supabase.com/docs/guides/auth)

Supabase was chosen because it offers production-grade email/password auth, JWT session handling with silent refresh, and a generous free tier — without requiring custom backend infrastructure for this take-home scope.

### Guest access (no login)

Reviewers can explore the portal immediately without Supabase credentials:

1. Start the dev server (`npm run dev`)
2. Open `/login`
3. Click **Continue as guest**
4. You are redirected to `/docs` with full access to documentation, sandbox, changelog, status, and analytics

Guest state persists across page reloads (via `sessionStorage`). The sidebar shows **Guest**; use **Exit guest mode** to return to login. Sandbox requests do not attach an auth token in guest mode (public APIs such as PokéAPI and JSONPlaceholder still work).

### Create a test user (optional)

1. Configure `.env` with your Supabase URL and anon key
2. Open `/signup` and register with any email and password (minimum 6 characters)
3. If email confirmation is enabled in Supabase, confirm the email (or disable **Confirm email** under **Authentication → Providers → Email** for local testing)
4. Sign in at `/login` — you will be redirected to `/docs`

Signed-in users get JWT-backed sessions; the sandbox auto-injects the access token when present. Sign out from the sidebar footer.

## Registered APIs

| ID | Name | Base URL | Live sandbox |
|----|------|----------|--------------|
| `pokeapi` | PokéAPI | `https://pokeapi.co/api/v2` | Yes |
| `stub-payments` | Payments API (stub) | `https://api.example.com/v1` | Stub only |
| `jsonplaceholder` | JSONPlaceholder Todos | `https://jsonplaceholder.typicode.com` | Yes |

The **Payments API** stub exists solely to demonstrate registry extensibility — it is not a real backend. Edit this api with your working api to check the extensibility.

## Reviewer guide: API extensibility check

This is the primary architectural criterion. Adding an API must **not** require editing any React components under `src/features/` or `src/components/`.

### What already proves extensibility

The repo ships three APIs registered in `src/apis/api-registry.ts`. The third (`jsonplaceholder`) was added using only:

- `src/apis/jsonplaceholder/openapi.json`
- `src/apis/jsonplaceholder/docs.md`
- `src/apis/jsonplaceholder/changelog.json`
- One new object in `API_REGISTRY`

No UI code was changed. After `npm run dev`, it appears automatically in:

- Sidebar **APIs** list
- `/docs` index cards
- `/docs/jsonplaceholder` (Getting Started, endpoints, error reference)
- Endpoint detail pages and sandbox
- Command palette (`Ctrl+K` / `Cmd+K`)
- Changelog and status pages

### 5-minute extensibility test (recommended)

1. `git clone <repo> && cd developer-portal && npm ci && npm run dev`
2. Click **Continue as guest** on `/login` (no Supabase setup needed)
3. Confirm three APIs appear in the sidebar
4. Add a fourth API stub:

   **a.** Create `src/apis/reviewer-test/openapi.json` (minimal OpenAPI 3.x, e.g. one `GET /health` endpoint)

   **b.** Add one import and one entry to `src/apis/api-registry.ts`:

   ```typescript
   import reviewerTestSpec from './reviewer-test/openapi.json'

   // append to API_REGISTRY:
   {
     id: 'reviewer-test',
     name: 'Reviewer Test API',
     version: '1.0.0',
     spec: reviewerTestSpec as OpenAPIObject,
     baseUrl: 'https://api.example.com',
   },
   ```

5. Save files — Vite HMR reloads the app
6. Verify **Reviewer Test API** appears in the sidebar and `/docs/reviewer-test` renders from the spec (no component edits)

Expected result: ≤ 5 minutes, zero changes outside `src/apis/`.

### Adding a new API (full steps)

Adding an API requires **no component changes**. Update only the registry and asset files:

1. Create a folder under `src/apis/<api-id>/` with a valid OpenAPI 3.x spec:

   ```
   src/apis/my-api/
   ├── openapi.json       # required
   ├── docs.md            # optional — Getting Started guide
   └── changelog.json     # optional — version history
   ```

2. Add one entry to `src/apis/api-registry.ts`:

   ```typescript
   import myApiSpec from './my-api/openapi.json'
   import myApiDocs from './my-api/docs.md?raw'
   import myApiChangelog from './my-api/changelog.json'

   // inside API_REGISTRY:
   {
     id: 'my-api',
     name: 'My API',
     version: '1.0.0',
     spec: myApiSpec as OpenAPIObject,
     docsMarkdown: myApiDocs,
     changelog: myApiChangelog as ChangelogEntry[],
     baseUrl: 'https://api.example.com',
     errors: [/* optional ErrorReference[] */],
     sdks: [/* optional SdkLink[] */],
   },
   ```

3. Restart or rely on HMR — the new API appears in the sidebar, docs, sandbox, changelog, and status pages automatically.

### Quick sandbox smoke test

| API | Suggested request |
|-----|-------------------|
| PokéAPI | `GET /pokemon/pikachu` |
| JSONPlaceholder | `GET /todos/1` |
| JSONPlaceholder | `POST /todos` with body `{"userId":1,"title":"Test","completed":false}` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Project structure

```
src/
├── apis/
│   ├── api-registry.ts       # single source of truth — only file to edit when adding an API
│   ├── types.ts
│   ├── pokeapi/
│   ├── stub-payments/        # minimal stub for extensibility demo
│   └── jsonplaceholder/
├── features/
│   ├── auth/                 # Supabase auth + guest mode
│   ├── docs/                 # OpenAPI spec renderer
│   ├── sandbox/              # live request builder
│   ├── keys/
│   ├── analytics/
│   ├── changelog/
│   └── status/
├── components/               # shared UI primitives & layout
└── lib/                      # spec-parser, snippet-generator, supabase client
```