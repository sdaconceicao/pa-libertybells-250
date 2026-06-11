# PWA Implementation

This app is a Progressive Web App (PWA). Users can install it from the browser on desktop and mobile, and it works offline after the first visit.

---

## Changes Made

### 1. `package.json` — new dev dependency

```
vite-plugin-pwa ^1.3.0
```

Wraps [Workbox](https://developer.chrome.com/docs/workbox/) and integrates with Vite's build pipeline to generate and configure the service worker automatically.

---

### 2. `vite.config.ts` — VitePWA plugin

Added `VitePWA(...)` to the plugins array.

**Key options:**

| Option | Value | Why |
|---|---|---|
| `registerType` | `"autoUpdate"` | SW silently updates in the background; no prompt needed for this content-heavy read-only app |
| `injectRegister` | `null` | TanStack Start renders HTML via SSR (Nitro), so the plugin can't inject into a static `index.html`. We register manually (see `__root.tsx` below). |
| `manifest` | `false` | We maintain `public/manifest.json` ourselves so it stays under version control and doesn't get overwritten by the plugin |

**Workbox caching strategies:**

| Cache | URL pattern | Strategy | Why |
|---|---|---|---|
| App shell | `**/*.{js,css,html,ico,svg}` | Precache | Bundled assets are fingerprinted; safe to cache forever |
| Bell images | `/bells/images/*` | CacheFirst (300 entries, 30 days) | Excluded from precache (too many files); loaded on demand and kept locally so repeat visits are instant offline |
| Map tiles | `*.tile.openstreetmap.org/*` | StaleWhileRevalidate (500 entries, 7 days) | Tiles change infrequently; serve cached copy immediately, refresh in background |
| Google Fonts stylesheet | `fonts.googleapis.com/*` | StaleWhileRevalidate | Serve cached version immediately, refresh quietly |
| Google Fonts files | `fonts.gstatic.com/*` | CacheFirst (10 entries, 365 days) | Font binaries never change for a given URL |

Bell images are **not** precached because there are 100+ files and precaching all of them on first load would be wasteful. They populate the `bell-images` cache organically as the user browses.

---

### 3. `public/manifest.json` — app identity

Updated from the generic TanStack template to the actual app:

- `name` → `"Bells Across Pennsylvania"`
- `short_name` → `"PA Bells"` (shown under the icon on the home screen)
- `description` → added
- `id` / `scope` / `start_url` → all set to `"/"`
- `theme_color` → `"#17074e"` (matches `--color-brand` CSS variable)
- `background_color` → `"#ffffff"`
- `orientation` → `"portrait-primary"`
- `icons` → kept existing 192/512 PNGs + SVG; added `icon-maskable.svg` (copied from `src/routes/-components/Logo/circle.svg`) with `"purpose": "maskable"` — the circular design already provides the safe-zone padding Android adaptive icons require
- `categories` → `["reference", "travel"]`

---

### 4. `src/routes/__root.tsx` — HTML head

**Added links:**

```ts
{ rel: "manifest", href: "/manifest.json" }   // makes the app installable
{ rel: "apple-touch-icon", href: "/logo192.png" }  // iOS home screen icon
```

**Added meta tags:**

```ts
{ name: "description", ... }                       // SEO + install sheet
{ name: "theme-color", content: "#17074e" }        // browser chrome tint

// iOS — Safari doesn't fully support the W3C manifest spec
{ name: "apple-mobile-web-app-capable", content: "yes" }
{ name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }
{ name: "apple-mobile-web-app-title", content: "PA Bells" }
```

`black-translucent` status bar lets the app's dark navy header bleed under the iOS status bar for a full-bleed look. If you prefer a solid status bar, change this to `"default"`.

**Added SW registration script:**

Because `injectRegister: null` is set in the Vite plugin, the SW must be registered manually. A small inline `<script>` was added to the `scripts` array:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

This runs on every page server-render and registers the worker once the page is fully loaded (avoids contending with page hydration).

---

## What still needs attention

### iOS splash screens

iOS Safari shows a white flash while the PWA launches. You can suppress this with `<link rel="apple-touch-startup-image">` tags sized for each device. Tooling: [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator).

### Update notification UI

With `registerType: "autoUpdate"`, the SW updates silently. That's fine for this app, but if you ever want to tell users "A new version is available — refresh", import `useRegisterSW` from `virtual:pwa-register/react` and wire up a toast.
