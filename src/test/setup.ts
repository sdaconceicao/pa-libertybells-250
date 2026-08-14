// Vitest global setup. jsdom omits a handful of DOM APIs that react-aria
// (which powers the @code-x/lago inputs) touches while opening overlays and
// running its focus/animation machinery. Without these, rendering a Select,
// MultiSelect, or SearchFieldWithSuggestions throws (e.g.
// "element.getAnimations is not a function") before any assertion runs.

// Overlay enter/exit transitions call getAnimations() on mount.
if (!Element.prototype.getAnimations) {
	Element.prototype.getAnimations = () => [];
}

// react-aria scrolls the focused option into view when navigating a listbox.
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}

// Pointer capture is used by react-aria's press interactions; jsdom lacks it.
if (!Element.prototype.hasPointerCapture) {
	Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
	Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
	Element.prototype.releasePointerCapture = () => {};
}

// react-aria reads matchMedia for reduced-motion / hover-capability checks.
if (!window.matchMedia) {
	window.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}

// react-aria builds CSS selectors with CSS.escape when scoping focus queries.
if (!globalThis.CSS) {
	// @ts-expect-error minimal shim; only `escape` is exercised in tests.
	globalThis.CSS = {};
}
if (!globalThis.CSS.escape) {
	globalThis.CSS.escape = (value: string) => value;
}

// Overlay positioning observes size changes.
if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
