import { describe, expect, it } from "vitest";
import type { Bell } from "./types";
import { searchBells } from "./searchBells";

function makeBell(overrides: Partial<Bell> & Pick<Bell, "id">): Bell {
	return {
		title: "Liberty Bell Replica",
		county: "York",
		address: { city: "York", zip: "17401" },
		sourceSlug: "test",
		lat: 40,
		lng: -77,
		...overrides,
		id: overrides.id,
	};
}

const sampleBells: Bell[] = [
	makeBell({ id: "a", title: "Gettysburg Liberty Bell", artist: "Jane Smith" }),
	makeBell({ id: "b", title: "Philadelphia Liberty", artist: "John Doe" }),
	makeBell({ id: "c", title: "Harrisburg Memorial" }),
];

describe("searchBells", () => {
	it("returns an empty array for blank queries", () => {
		expect(searchBells(sampleBells, "")).toEqual([]);
		expect(searchBells(sampleBells, "   ")).toEqual([]);
	});

	it("matches bell titles case-insensitively", () => {
		expect(
			searchBells(sampleBells, "gettysburg").map((bell) => bell.id),
		).toEqual(["a"]);
	});

	it("matches bell artists case-insensitively", () => {
		expect(searchBells(sampleBells, "john").map((bell) => bell.id)).toEqual([
			"b",
		]);
	});

	it("returns multiple matches when query appears in several bells", () => {
		expect(searchBells(sampleBells, "liberty").map((bell) => bell.id)).toEqual([
			"a",
			"b",
		]);
	});

	it("returns an empty array when nothing matches", () => {
		expect(searchBells(sampleBells, "zanzibar")).toEqual([]);
	});
});
