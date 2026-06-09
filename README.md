# Bells Across PA

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
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm lint` | Lint with Biome |
| `pnpm format` | Format with Biome |
| `pnpm check` | Lint and format check (Biome) |
| `pnpm sync:bells` | Fetch, parse, geocode, and write bell data |

## Bell data sync

Bell locations are stored in `src/lib/bells/bells.data.json`. To refresh that file from the official Bells Across PA page:

1. Copy `.env.example` to `.env` and set `OPENCAGE_API_KEY` (used for geocoding).
2. Run:

```bash
pnpm sync:bells
```

The script fetches HTML, parses bell entries (including indoors/outdoors footnotes when they match known page options), geocodes addresses (with overrides in `src/lib/bells/geocode-overrides.json`), downloads bell images to `public/bells/images/`, generates 80×80 WebP thumbnails in `public/bells/images/thumbs/`, and writes the updated JSON.

## Tech stack

- [TanStack Start](https://tanstack.com/start) and [TanStack Router](https://tanstack.com/router) (file-based routes in `src/routes/`)
- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 7 with [Nitro](https://nitro.build/)
- [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/) for the map
- [Biome](https://biomejs.dev/) for linting and formatting
- [Vitest](https://vitest.dev/) for unit tests (`vitest.config.ts` — separate from `vite.config.ts` so app plugins do not run during tests)

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
