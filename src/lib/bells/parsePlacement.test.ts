import { describe, expect, it } from "vitest";
import { normalizeFootnote, parseBellPlacement } from "./parsePlacement";

describe("normalizeFootnote", () => {
	it("strips asterisk, normalizes case, and trailing periods", () => {
		expect(normalizeFootnote("*The bell is located outdoors.")).toBe(
			"the bell is located outdoors",
		);
	});
});

describe("parseBellPlacement", () => {
	it("returns indoors for the canonical indoors footnote", () => {
		expect(
			parseBellPlacement([
				"This bell is indoors and only available for viewing during operating hours.",
			]),
		).toBe("indoors");
		expect(
			parseBellPlacement([
				"This bell is indoors and only available for viewing during operating hours",
			]),
		).toBe("indoors");
	});

	it("returns outdoors for listed outdoors footnotes", () => {
		expect(parseBellPlacement(["The bell is located outdoors."])).toBe(
			"outdoors",
		);
		expect(
			parseBellPlacement(["This bell requires using stairs to access it."]),
		).toBe("outdoors");
		expect(
			parseBellPlacement([
				"This bell is outdoors and only available for viewing during operating hours.",
			]),
		).toBe("outdoors");
		expect(
			parseBellPlacement([
				"This bell is located indoors through April, 2026. It will be moved outdoors to the 9th Street Garden.",
			]),
		).toBe("outdoors");
	});

	it("returns undefined for unknown or missing footnotes", () => {
		expect(parseBellPlacement([])).toBeUndefined();
		expect(parseBellPlacement(["This bell is outdoors."])).toBeUndefined();
		expect(
			parseBellPlacement(["This bell is located outdoors."]),
		).toBeUndefined();
		expect(
			parseBellPlacement([
				"This bell is indoors and only available for viewing during operating hours from November through April in the DG2Go Pizza Shop. This bell is located outside the main entrance from May through October.",
			]),
		).toBeUndefined();
	});
});
