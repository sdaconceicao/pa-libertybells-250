import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/** Vercel static assets — must match where the client build writes files. */
const staticOutDir = ".vercel/output/static";

const navigationCache = {
	urlPattern: ({ request }: { request: Request }) =>
		request.mode === "navigate",
	handler: "NetworkFirst" as const,
	options: {
		cacheName: "pages",
		networkTimeoutSeconds: 3,
		expiration: {
			maxEntries: 10,
			maxAgeSeconds: 60 * 60 * 24,
		},
	},
};

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
			// Write sw.js next to deployed static assets (not dist/client)
			outDir: staticOutDir,
			includeAssets: [
				"favicon.svg",
				"favicon.ico",
				"manifest.json",
				"icon-maskable.svg",
				"robots.txt",
			],
			integration: {
				configureOptions(viteConfig, options) {
					if (viteConfig.build.ssr) {
						options.disable = true;
						return;
					}
					// Client + nitro builds both have ssr:false; only emit the SW for static assets.
					const outDir = viteConfig.build.outDir ?? "";
					if (
						outDir.includes("/functions/") ||
						outDir.includes("node_modules/.nitro")
					) {
						options.disable = true;
					}
				},
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
			workbox: {
				// SSR app — no index.html shell; cache document responses instead
				navigateFallback: null,
				globDirectory: staticOutDir,
				globPatterns: ["**/*.{js,css,ico,svg,woff2}"],
				globIgnores: ["**/bells/images/**", "sw.js", "workbox-*.js"],
				runtimeCaching: [
					navigationCache,
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
