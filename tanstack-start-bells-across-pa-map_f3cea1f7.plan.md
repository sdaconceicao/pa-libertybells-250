---
name: tanstack-start-bells-across-pa-map
overview: Build a TanStack Start app that scrapes bell locations and images from the America250PA Bells Across PA page and displays them as markers on an interactive Leaflet/OpenStreetMap map.
todos:
  - id: setup-tanstack-start
    content: Initialize TanStack Start app and install dependencies (Leaflet, cheerio, etc.)
    status: in_progress
  - id: scrape-parse-bells
    content: Implement server-side fetch and HTML parser for Bells Across PA into structured bell records
    status: pending
  - id: geocode-bell-addresses
    content: Implement geocoding and caching to enrich bells with latitude/longitude and store results as JSON
    status: pending
  - id: integrate-data-tanstack
    content: Expose bell data via a TanStack Start loader or API route
    status: pending
  - id: build-leaflet-map-ui
    content: Create Leaflet-based map component showing markers and popups for each bell
    status: pending
  - id: add-filters-ux
    content: Polish layout, add basic filtering/search, and document setup commands in README
    status: pending
isProject: false
---

### High-level approach

- **Goal**: Create a TanStack Start app that scrapes all bells (county, title, current location address, image) from the America250PA "Bells Across PA" page and shows them as interactive markers on a Leaflet + OpenStreetMap map.
- **Key pieces**:
  - A **data ingestion layer** that fetches and parses the Bells Across PA HTML into structured JSON (county, name, address, image URL, description, sponsor etc.).
  - A **geocoding step** that converts human-readable addresses into latitude/longitude.
  - A **map UI** built with TanStack Start + React using Leaflet to display markers and popups with bell details.
  - A **simple API or loader** in TanStack Start to serve the bell data to the client.

### Data ingestion & modeling

- **Define types**
  - Create a shared TypeScript type such as `Bell` with fields like `id`, `county`, `title`, `currentAddress`, `unveilingAddress?`, `artist`, `imageUrl`, `sponsor?`, `lat`, `lng`, `sourceSlug`.
  - Put shared types in a small module like `[app/src/lib/bells/types.ts](app/src/lib/bells/types.ts)` so both server and client can use them.
- **Fetch Bells Across PA HTML**
  - Implement a server-side utility that uses `fetch` (or `node-fetch`/`undici` depending on TanStack Start runtime) to download the Bells Across PA page HTML from `https://www.america250pa.org/PPE:_Bells_Across_PA`.
  - Store this logic in `[app/src/lib/bells/fetchPage.ts](app/src/lib/bells/fetchPage.ts)`.
- **HTML parsing**
  - Use a DOM parsing library (e.g. `cheerio`) to traverse the America250PA HTML.
  - Identify patterns for each bell entry (e.g. a container per county with bold title, artist line, current location line, and image tag) based on the page structure.
  - Implement a parser that extracts:
    - County name.
    - Bell title.
    - Artist name(s).
    - Current location text (treat as address string).
    - Optional unveiling location if present.
    - Image URL (from `<img>` tag in the entry).
  - Normalize and clean the extracted text (trim spaces, remove non-address parts like "Current Location:" prefixes).
  - Put this in `[app/src/lib/bells/parsePage.ts](app/src/lib/bells/parsePage.ts)` with a function like `parseBells(html: string): RawBell[]`.

### Geocoding & data persistence

- **Geocoding strategy**
  - Use a server-side geocoding step that runs occasionally (e.g. via a script or on-demand route action) so the front-end never calls the geocoder directly.
  - Prefer a provider that works well with OpenStreetMap/Leaflet, like **Nominatim** or a hosted alternative; optionally allow plugging in Google Geocoding if the user later provides an API key.
  - Implement a function `geocodeBellAddresses(rawBells: RawBell[]): Promise<GeocodedBell[]>` in `[app/src/lib/bells/geocode.ts](app/src/lib/bells/geocode.ts)` that:
    - Caches previous geocoding results by normalized address (e.g. in a simple JSON file or SQLite/Prisma DB) to avoid re-hitting the API.
    - Skips geocoding if coordinates already exist.
    - Handles failed geocodes gracefully with warnings and optional manual fallback coordinates.
- **Data storage**
  - For simplicity, store the geocoded output as a static JSON file checked into the repo, e.g. `[app/src/lib/bells/bells.data.json](app/src/lib/bells/bells.data.json)`.
  - Create a small Node script in `[scripts/syncBells.ts](scripts/syncBells.ts)` that:
    - Fetches the HTML.
    - Parses bell records.
    - Runs geocoding and updates the JSON file.
  - Document how to run this script (e.g. `npm run sync:bells`) in `README.md`.

### TanStack Start integration

- **Project setup**
  - Initialize a TanStack Start app (if not already) with a typical structure (`app/routes`, `app/components`, etc.).
  - Install dependencies: `react-leaflet`, `leaflet`, `cheerio`, and chosen geocoding http client (plain `fetch` is often enough).
  - Ensure Vite/TanStack Start asset handling supports importing the JSON data file.
- **Server loader or API endpoint**
  - Create a route loader (e.g. in `[app/routes/_index.tsx](app/routes/_index.tsx)`) or a dedicated API route (e.g. `[app/routes/api/bells.ts](app/routes/api/bells.ts)`) that reads `bells.data.json` and returns strongly-typed bell data to the client.
  - Optionally support query parameters later (e.g. filter by county), but initially just return all bells.

### Map UI with Leaflet

- **Leaflet base setup**
  - Add Leaflet CSS in the app root (e.g. import in `[app/root.tsx](app/root.tsx)` or global stylesheet).
  - Create a reusable `BellsMap` React component in `[app/components/BellsMap.tsx](app/components/BellsMap.tsx)` that:
    - Uses `MapContainer`, `TileLayer`, and `Marker`/`Popup` from `react-leaflet`.
    - Sets a default view centered on Pennsylvania (e.g. lat ~ 40.9, lng ~ -77.8, zoom 7).
    - Uses an OSM tile URL such as `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with proper attribution.
- **Markers & popups**
  - Render one marker per bell using their `lat`/`lng`.
  - For each marker, render a popup that includes:
    - Bell title and county.
    - Artist name(s).
    - Current location address.
    - Image (using the image URL parsed from America250PA; proxy through the app if CORS issues arise).
    - Optional sponsor or a link back to the America250PA bell page/section.
- **List + map interaction (optional)**
  - Add a sidebar or list under the map showing all bells.
  - Allow clicking on a bell in the list to pan/zoom the map to that marker and open its popup.

### UX and visual polish

- **Responsive layout**
  - Make the map full-width on mobile, with a vertical list below.
  - On larger screens, use a split layout (e.g. map on the left, scrollable list on the right) with CSS grid or flexbox.
- **Filtering and search (optional)**
  - Add a simple county filter dropdown and/or text search box that filters the markers and bell list.
  - Implement filtering on the client using the bell data from the loader.

### Configuration & docs

- **Environment & configuration**
  - Add configuration for geocoding provider and rate limits (e.g. env vars like `GEOCODER_BASE_URL`, `GEOCODER_EMAIL` for Nominatim) in a `.env.example` file.
  - Ensure TanStack Start server code reads env vars safely without leaking secrets to the client.
- **README and usage**
  - Update `README.md` with:
    - How to install and run the TanStack Start app.
    - How to run the `sync:bells` script to refresh data from America250PA.
    - Any caveats around geocoding API usage and quotas.

### Future enhancements (optional)

- **Auto-refresh schedule**: Add a small cron job or CI step that re-runs `sync:bells` weekly and commits updated JSON if America250PA adds/changes bells.
- **Clustering**: For a dense region, add Leaflet marker clustering to keep the map readable.
- **Analytics**: Track which bells are clicked most often (e.g. with a simple event logger) if desired.
