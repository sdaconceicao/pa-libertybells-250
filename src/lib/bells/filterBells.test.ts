import { describe, expect, it } from "vitest";
import type { Bell } from "./types";
import {
	DEFAULT_BELL_FILTERS,
	filterBells,
	filtersAreDefault,
	filtersEqual,
	getCountyOptions,
} from "./filterBells";

function makeBell(
	overrides: Partial<Bell> & Pick<Bell, "id" | "county">,
): Bell {
	return {
		title: "Test Bell",
		address: { street: "123 Main St", city: "York", zip: "17401" },
		sourceSlug: "test",
		lat: 40,
		lng: -77,
		...overrides,
		id: overrides.id,
		county: overrides.county,
	};
}

const sampleBells: Bell[] = [
	makeBell({ id: "a", county: "York", placement: "indoors" }),
	makeBell({ id: "b", county: "Adams", placement: "outdoors" }),
	makeBell({ id: "c", county: "York" }),
	makeBell({ id: "d", county: "Berks", placement: "indoors" }),
];

describe("getCountyOptions", () => {
	it("returns unique counties sorted alphabetically", () => {
		expect(getCountyOptions(sampleBells)).toEqual(["Adams", "Berks", "York"]);
	});

	it("returns an empty array for no bells", () => {
		expect(getCountyOptions([])).toEqual([]);
	});
});

describe("filtersEqual", () => {
	it("treats county order as irrelevant", () => {
		expect(
			filtersEqual(
				{ counties: ["York", "Adams"], placement: "all" },
				{ counties: ["Adams", "York"], placement: "all" },
			),
		).toBe(true);
	});

	it("detects different placement", () => {
		expect(
			filtersEqual(
				{ counties: [], placement: "all" },
				{ counties: [], placement: "indoors" },
			),
		).toBe(false);
	});
});

describe("filtersAreDefault", () => {
	it("returns true for default filters", () => {
		expect(filtersAreDefault(DEFAULT_BELL_FILTERS)).toBe(true);
	});

	it("returns false when counties are selected", () => {
		expect(filtersAreDefault({ counties: ["York"], placement: "all" })).toBe(
			false,
		);
	});
});

describe("filterBells", () => {
	it("returns all bells with default filters", () => {
		expect(filterBells(sampleBells, DEFAULT_BELL_FILTERS)).toEqual(sampleBells);
	});

	it("filters by selected counties", () => {
		const result = filterBells(sampleBells, {
			counties: ["York"],
			placement: "all",
		});
		expect(result.map((bell) => bell.id)).toEqual(["a", "c"]);
	});

	it("includes only indoor bells when placement is indoors", () => {
		const result = filterBells(sampleBells, {
			counties: [],
			placement: "indoors",
		});
		expect(result.map((bell) => bell.id)).toEqual(["a", "d"]);
	});

	it("includes only outdoor bells when placement is outdoors", () => {
		const result = filterBells(sampleBells, {
			counties: [],
			placement: "outdoors",
		});
		expect(result.map((bell) => bell.id)).toEqual(["b"]);
	});

	it("excludes unknown placement for indoor and outdoor filters", () => {
		const indoors = filterBells(sampleBells, {
			counties: [],
			placement: "indoors",
		});
		const outdoors = filterBells(sampleBells, {
			counties: [],
			placement: "outdoors",
		});
		expect(indoors.some((bell) => bell.id === "c")).toBe(false);
		expect(outdoors.some((bell) => bell.id === "c")).toBe(false);
	});

	it("combines county and placement filters", () => {
		const result = filterBells(sampleBells, {
			counties: ["York"],
			placement: "indoors",
		});
		expect(result.map((bell) => bell.id)).toEqual(["a"]);
	});
});
