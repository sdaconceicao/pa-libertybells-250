import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";

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
	],
	test: {
		include: ["src/**/*.test.ts"],
	},
});

export default config;
