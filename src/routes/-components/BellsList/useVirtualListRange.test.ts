import { describe, expect, it } from "vitest";
import { getVirtualListRange } from "./useVirtualListRange";

describe("getVirtualListRange", () => {
	it("returns an empty range when there are no items", () => {
		expect(getVirtualListRange(0, 400, 0, 56, 4)).toEqual({
			start: 0,
			end: 0,
		});
	});

	it("returns visible items with overscan", () => {
		expect(getVirtualListRange(0, 400, 20, 56, 2)).toEqual({
			start: 0,
			end: 12,
		});
	});

	it("offsets the start index based on scroll position", () => {
		expect(getVirtualListRange(280, 400, 20, 56, 2)).toEqual({
			start: 3,
			end: 15,
		});
	});
});
