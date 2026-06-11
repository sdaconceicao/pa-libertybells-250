import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
	plugins: [
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tanstackStart(),
		nitro({
			preset: "vercel",
			vercel: {
				entryFormat: "node",
			},
		}),
		viteReact(),
		VitePWA({
			registerType: "autoUpdate",
			// TanStack Start renders HTML via SSR, so we register the SW manually
			injectRegister: null,
			// We maintain manifest.json ourselves
			manifest: false,
			workbox: {
				// Precache all JS, CSS, HTML, and core assets
				globPatterns: ["**/*.{js,css,html,ico,svg}"],
				// Bell images are too many to precache — served via runtime cache below
				globIgnores: ["**/bells/images/**"],
				runtimeCaching: [
					{
						// Bell photos — cache-first, kept for 30 days
						urlPattern: /\/bells\/images\/.+/,
						handler: "CacheFirst",
						options: {
							cacheName: "bell-images",
							expiration: {
								maxEntries: 300,
								maxAgeSeconds: 60 * 60 * 24 * 30,
							},
						},
					},
					{
						// OpenStreetMap tiles — stale-while-revalidate, kept for 7 days
						urlPattern: /^https:\/\/[a-z]\.tile\.openstreetmap\.org\/.+/,
						handler: "StaleWhileRevalidate",
						options: {
							cacheName: "map-tiles",
							expiration: {
								maxEntries: 500,
								maxAgeSeconds: 60 * 60 * 24 * 7,
							},
						},
					},
					{
						// Google Fonts stylesheet
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.+/,
						handler: "StaleWhileRevalidate",
						options: { cacheName: "google-fonts-stylesheets" },
					},
					{
						// Google Fonts font files
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.+/,
						handler: "CacheFirst",
						options: {
							cacheName: "google-fonts-webfonts",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
						},
					},
				],
			},
		}),
	],
	test: {
		include: ["src/**/*.test.ts"],
	},
});

export default config;
