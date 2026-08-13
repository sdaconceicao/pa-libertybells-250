/// <reference types="vite/client" />

declare module "*.module.css" {
	const classes: Record<string, string>;
	export default classes;
}

// Side-effect stylesheet shipped by @code-x/lago. Its `./styles` export maps
// straight to dist/index.css with no `types` entry, and vite/client's `*.css`
// wildcard doesn't match the bare specifier, so `noUncheckedSideEffectImports`
// has nothing to resolve without this.
declare module "@code-x/lago/styles";
