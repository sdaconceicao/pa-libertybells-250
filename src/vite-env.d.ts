/// <reference types="vite/client" />

declare module "*.module.css" {
	const classes: Record<string, string>;
	export default classes;
}

// Side-effect stylesheet shipped by @code-x/lago (CSS subpath has no types).
declare module "@code-x/lago/styles";
