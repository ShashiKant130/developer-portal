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

## Tech stack

- React 19 + TypeScript (strict)
- Vite 8
- TanStack Query & React Router
- Tailwind CSS v4
- Supabase Auth
- Zustand (local UI state)
- Recharts (analytics)


## Getting started

```bash
git clone <repository-url>
cd developer-portal
npm ci
cp .env.example .env   # fill in your Supabase credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or the port Vite prints in the terminal).

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

### Create a test user

1. Start the dev server (`npm run dev`)
2. Open `/signup`
3. Register with any email and a password (minimum 6 characters)
4. Sign in at `/login` — you will be redirected to `/docs`

Protected routes require an active session. Sign out from the sidebar footer.

## Registered APIs

| ID | Name | Base URL |
|----|------|----------|
| `pokeapi` | PokéAPI | `https://pokeapi.co/api/v2` |
| `stub-payments` | Payments API (stub) | `https://api.example.com/v1` |
| `jsonplaceholder` | JSONPlaceholder Todos | `https://jsonplaceholder.typicode.com` |

PokéAPI and JSONPlaceholder support live sandbox requests. The Payments API stub is for registry extensibility testing.

## Adding a new API

Adding an API requires **no component changes**. Update only the registry and asset files:

1. Create a folder under `src/apis/<api-id>/` with a valid OpenAPI 3.x spec:

   ```
   src/apis/my-api/
   ├── openapi.json
   ├── docs.md          # optional — Getting Started guide
   └── changelog.json   # optional — version history
   ```

2. Add one entry to `src/apis/api-registry.ts`:

   ```typescript
   import myApiSpec from './my-api/openapi.json'
   import myApiDocs from './my-api/docs.md?raw'

   // inside API_REGISTRY:
   {
     id: 'my-api',
     name: 'My API',
     version: '1.0.0',
     spec: myApiSpec as OpenAPIObject,
     docsMarkdown: myApiDocs,
     baseUrl: 'https://api.example.com',
   },
   ```

3. Restart the dev server — the new API appears in the sidebar, docs, sandbox, changelog, and status pages automatically.

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
│   ├── api-registry.ts       # single source of truth
│   ├── pokeapi/
│   ├── stub-payments/
│   └── jsonplaceholder/
├── features/
│   ├── auth/
│   ├── docs/
│   ├── sandbox/
│   ├── keys/
│   ├── analytics/
│   ├── changelog/
│   └── status/
├── components/               # shared UI primitives & layout
└── lib/                      # spec parser, snippet generator, utils
```