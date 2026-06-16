# Bells Across PA PWA

The current Bells Across PA site has updated information, but doesn't provide a good way of visualizing where the bells are.  This site provides a better representation of all of the bells on a map, with the ability to filter and search coming.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `pn dev` | Start the Vite dev server |
| `pn build` | Production build |
| `pn preview` | Preview the production build locally |
| `pn test` | Run unit tests (Vitest) |
| `pn lint` | Lint with Biome |
| `pn format` | Format with Biome |
| `pn check` | Lint and format check (Biome) |
| `pn sync:bells` | Fetch, parse, geocode, and write bell data |
| `pn auth:generate` | Regenerate the Better Auth Drizzle schema |
| `pn db:generate` | Generate a Drizzle SQL migration from the schema |
| `pn db:migrate` | Apply pending Drizzle migrations to the database |
| `pn db:push` | Push the schema directly to the database (no migration files) |
| `pn db:studio` | Open Drizzle Studio |

## Bell data sync

Bell locations are stored in `src/lib/bells/bells.data.json`. To refresh that file from the official Bells Across PA page:

1. Copy `.env.example` to `.env` and set `OPENCAGE_API_KEY` (used for geocoding).
2. Run:

```bash
pnpm sync:bells
```

The script fetches HTML, parses bell entries (including indoors/outdoors footnotes when they match known page options), geocodes addresses (with overrides in `src/lib/bells/geocode-overrides.json`), downloads bell images to `public/bells/images/`, and writes the updated JSON.

## Authentication & database

Auth is handled by [Better Auth](https://better-auth.com) with a [Neon](https://neon.tech) Postgres database accessed through [Drizzle ORM](https://orm.drizzle.team). Users can sign up / log in with email + password or with Google or Facebook. The account control lives in the top-right circle on every page (`src/components/AccountMenu/`); once logged in it becomes an avatar with the user's initials.

Key files:

- `src/lib/auth/auth.ts` — server-side Better Auth instance (providers, adapter). Server-only.
- `src/lib/auth/auth-client.ts` — client used by components (`signIn`, `signUp`, `signOut`, `useSession`).
- `src/routes/api/auth/$.ts` — catch-all handler mounted at `/api/auth/*`.
- `src/lib/db/schema.ts` — Drizzle schema: Better Auth tables (`user`, `session`, `account`, `verification`) plus `favorite` and `been_to` for upcoming features.
- `src/lib/db/index.ts` — Neon + Drizzle connection.

### Local setup

1. Copy `.env.example` to `.env` and fill in the new values (see below).
2. Generate a secret: `openssl rand -base64 32` → `BETTER_AUTH_SECRET`.
3. **Neon** — create a project at [neon.tech](https://neon.tech), copy the (pooled) connection string into `DATABASE_URL`.
4. Create the tables: `pnpm db:push` (or `pnpm db:generate && pnpm db:migrate` to keep migration files).
5. **Google OAuth** — at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an OAuth client; set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google` (and your prod URL). Copy the id/secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
6. **Facebook OAuth** — at [Facebook for Developers](https://developers.facebook.com/apps) add the *Facebook Login* product; set the valid OAuth redirect URI to `http://localhost:3000/api/auth/callback/facebook` (and your prod URL). Copy the id/secret into `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`.
7. `pnpm dev`.

If you change auth config that affects the schema, regenerate with `pnpm auth:generate`, then `pnpm db:push`.

### Vercel deployment

Add the same env vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and the four OAuth vars) under **Project → Settings → Environment Variables**. Set `BETTER_AUTH_URL` to the deployed origin (e.g. `https://your-app.vercel.app`) and add the matching `/api/auth/callback/{google,facebook}` redirect URIs in each provider's console. The easiest way to provision the database is the [Neon Vercel integration](https://vercel.com/integrations/neon), which injects `DATABASE_URL` automatically.

## Tech stack

- [TanStack Start](https://tanstack.com/start) and [TanStack Router](https://tanstack.com/router) (file-based routes in `src/routes/`)
- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 7 with [Nitro](https://nitro.build/)
- [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/) for the map
- [Better Auth](https://better-auth.com/) for authentication (email/password + Google + Facebook)
- [Neon](https://neon.tech/) Postgres with [Drizzle ORM](https://orm.drizzle.team/)
- [Biome](https://biomejs.dev/) for linting and formatting
- [Vitest](https://vitest.dev/) for unit tests (`vitest.config.ts` — separate from `vite.config.ts` so app plugins do not run during tests)
- [Vercel](https://vercel.com) for hosting

## Testing

Unit tests live next to source files (e.g. `src/lib/bells/parseAddress.test.ts`).

```bash
pnpm test
```

## CI

Pull requests and pushes to `main` run lint, format, typecheck, and tests via GitHub Actions (see `.github/workflows/`).

## Learn more

- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
