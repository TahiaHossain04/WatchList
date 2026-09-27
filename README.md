# 🍬 Tahia's Watch List

A personal media library for everything I've **watched**, am **currently watching**, **want to watch**, or have **abandoned**: K-dramas, anime, movies, documentaries and more.

Anyone can browse the library. Only I can log in to add, edit or delete entries.

Each status button (Watched, Currently Watching, Want to Watch, Abandoned) opens a wall of little retro **TV channels**, one per collection: K-Drama, C-Drama, Anime, Thai, North American, Indian (and Other). Clicking a TV opens that collection's **tape rack**: every title is a VHS tape with its name on the label, and a **Dramas | Movies** switch keeps series and films apart.

**Hearts and crosses:** favourites (♥) glow and can be numbered (#1 = most loved; numbers are unique per collection + dramas/movies), and the **♥ Favourites** button lists them in order. Titles marked ✕ are shown greyed out. The **?** button on every page explains this to visitors. A poster grid view is also available, and it switches to real posters once an entry has a `poster_url`.

| URL | Page |
| --- | ---- |
| `/watched` | the TV channels for Watched |
| `/watched/k-drama` | the K-Drama shelf (same pattern for every status and collection) |
| `/entry/:id` | one title |

## Screenshots

_Coming soon._

| Home | Bookshelf | Entry |
| ---- | --------- | ----- |
|      |           |       |

---

## Tech stack

| Layer    | Tools |
| -------- | ----- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Framer Motion |
| Backend  | Node.js, Express 5, TypeScript, Zod (validation) |
| Data     | Supabase PostgreSQL |
| Auth     | Supabase Auth (one admin account, no public sign-up) |

## Architecture

```text
tahias-watch-list/
├── client/                    React app (Vite)
│   └── src/
│       ├── components/
│       │   ├── channels/      TvSet (the collection TVs)
│       │   ├── layout/        Navbar, Layout, PageHeader, RequireAdmin
│       │   ├── library/       Shelf, Tape, MediaCard, Poster, FilterBar, TypeToggle, …
│       │   ├── entries/       ReactionBadge (♥/✕), ProgressCard, DetailSection
│       │   ├── forms/         EntryForm (shared by Add + Edit), Field, RatingInput
│       │   └── ui/            BubbleTitle, StatusButton, Bubble, ChipGroup, ConfirmDialog, …
│       ├── pages/             Home, ChannelsPage (+ Watched/Watching/… wrappers), CollectionPage,
│       │                      EntryDetails, Login, AddEntry, EditEntry, NotFound
│       ├── hooks/             useEntries, useEntry, useLibraryFilters
│       ├── services/          apiClient, entriesApi, authService, supabaseClient
│       ├── contexts/          Theme, Auth, Toast
│       ├── styles/theme.css   ← ALL COLORS LIVE HERE
│       └── utils/             labels, formatting, sorting, form helpers
├── server/                    Express API
│   └── src/
│       ├── routes/            /api/entries, /api/auth
│       ├── controllers/       request → service → response
│       ├── services/          Supabase store, in-memory demo store, auth check
│       ├── middleware/        requireAdmin, errorHandler
│       └── types/             Zod schemas + Entry type
└── supabase/schema.sql        Database table, enums, RLS policies
```

**How security works**

- The browser only has the Supabase **anon** key, which it uses to log in. Row Level Security lets that key *read* entries, never write them.
- Every write goes through the Express API. `requireAdmin` checks the Supabase login token **and** that the email matches `ADMIN_EMAIL`. Hiding buttons in the UI is only cosmetic.
- The **service-role** key (which can write) lives only in `server/.env`.

**API**

| Method | Path | Who |
| ------ | ---- | --- |
| GET    | `/api/entries?status=&collection=&type=&search=` | anyone |
| GET    | `/api/entries/:id` | anyone |
| POST   | `/api/entries` | admin |
| PATCH  | `/api/entries/:id` | admin |
| DELETE | `/api/entries/:id` | admin |
| GET    | `/api/auth/me` | anyone (reports whether the token is the admin) |

Responses are `{ "data": … }` on success and `{ "error": { "message", "details" } }` on failure. For validation errors, `details` maps each field to its message.

---

## Quick start (demo mode, no setup)

```bash
npm run install:all   # installs root, client and server dependencies
npm run dev           # starts the API on :4000 and the site on :5173
```

Open <http://localhost:5173>. Without Supabase credentials the server runs in **demo mode**: entries are saved to `server/data/demo-db.json`, so they survive restarts. Delete that file to go back to the sample data. Log in with any email and the password **`demo`**. Demo login is refused when `NODE_ENV=production`.

## Real setup with Supabase

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Create the database:** open *SQL Editor → New query*, paste [`supabase/schema.sql`](supabase/schema.sql), and click *Run*.
3. **Turn off public sign-ups:** *Authentication → Sign In / Providers → Email*: disable "Allow new users to sign up".
4. **Create your admin account:** *Authentication → Users → Add user* (email + password, auto-confirm).
5. **Fill in the environment files** (copy the examples):

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   | File | Variable | Where to find it |
   | ---- | -------- | ---------------- |
   | `server/.env` | `SUPABASE_URL` | Project Settings → API → Project URL |
   | `server/.env` | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key (**secret**) |
   | `server/.env` | `ADMIN_EMAIL` | the email you created in step 4 |
   | `server/.env` | `CLIENT_ORIGIN` | where the site runs (default `http://localhost:5173`) |
   | `client/.env` | `VITE_SUPABASE_URL` | same Project URL |
   | `client/.env` | `VITE_SUPABASE_ANON_KEY` | Project Settings → API → `anon` / publishable key |
   | `client/.env` | `VITE_API_URL` | only if the API is hosted on a different domain in production |

6. `npm run dev` and log in at `/login`.

## Commands

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Run client + server together (hot reload) |
| `npm run dev --prefix client` | Client only (<http://localhost:5173>) |
| `npm run dev --prefix server` | Server only (<http://localhost:4000>) |
| `npm run typecheck` | TypeScript check for both |
| `npm run build` | Production build (`server/dist`, `client/dist`) |
| `npm start --prefix server` | Run the built server |

**Deploying:** host `client/dist` on any static host (Vercel, Netlify…) with a rewrite of all paths to `index.html`, and set `VITE_API_URL` to your API's URL. Run the server on Render, Railway, Fly.io or similar, with `NODE_ENV=production` and `CLIENT_ORIGIN` set to your site's URL.

---

## Customising

- **Colors:** `client/src/styles/theme.css`. Dark theme in `:root`, light theme in `[data-theme="light"]`.
- **Fonts:** loaded in `client/index.html`, assigned in `client/src/index.css` (`--font-title`, `--font-candy`, `--font-body`).
- **Sections, collection names/URLs/order, the Dramas/Movies toggle labels, empty-state messages, collection colors:** `client/src/utils/labels.ts`.
- **TV sets (screen, static, antenna wiggle):** the "TV SETS" block in `client/src/index.css`.
- **Tape look / favourite glow / greyed-out style:** the "VHS TAPES" block in `client/src/index.css`; tape widths in `client/src/components/library/Tape.tsx`; rack height `--row-h`.
- **Help text (?):** `client/src/components/layout/HelpButton.tsx`.
- **Title animation (bounce, speed, stagger):** the constants at the top of `client/src/components/ui/BubbleTitle.tsx`.
- **Button hover and shapes:** `client/src/components/ui/StatusButton.tsx`.

## Future ideas

- TMDB search in *Add Entry* to auto-fill title, poster, synopsis, cast and year (the `tmdb_id` column is ready; the key stays on the server behind a `/api/tmdb` proxy)
- Jikan (anime) and Wikipedia metadata
- Real genres, tags, favourites ♡, rewatch count
- A statistics page and a yearly "wrapped" page
- Import / export
