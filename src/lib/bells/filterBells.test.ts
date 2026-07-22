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
				{
					counties: ["York", "Adams"],
					placement: "all",
					maxDistanceMiles: null,
				},
				{
					counties: ["Adams", "York"],
					placement: "all",
					maxDistanceMiles: null,
				},
			),
		).toBe(true);
	});

	it("detects different placement", () => {
		expect(
			filtersEqual(
				{ counties: [], placement: "all", maxDistanceMiles: null },
				{ counties: [], placement: "indoors", maxDistanceMiles: null },
			),
		).toBe(false);
	});

	it("detects a different distance radius", () => {
		expect(
			filtersEqual(
				{ counties: [], placement: "all", maxDistanceMiles: null },
				{ counties: [], placement: "all", maxDistanceMiles: 50 },
			),
		).toBe(false);
	});
});

describe("filtersAreDefault", () => {
	it("returns true for default filters", () => {
		expect(filtersAreDefault(DEFAULT_BELL_FILTERS)).toBe(true);
	});

	it("returns false when counties are selected", () => {
		expect(
			filtersAreDefault({
				counties: ["York"],
				placement: "all",
				maxDistanceMiles: null,
			}),
		).toBe(false);
	});

	it("returns false when a distance radius is set", () => {
		expect(
			filtersAreDefault({
				counties: [],
				placement: "all",
				maxDistanceMiles: 25,
			}),
		).toBe(false);
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
			maxDistanceMiles: null,
		});
		expect(result.map((bell) => bell.id)).toEqual(["a", "c"]);
	});

	it("includes only indoor bells when placement is indoors", () => {
		const result = filterBells(sampleBells, {
			counties: [],
			placement: "indoors",
			maxDistanceMiles: null,
		});
		expect(result.map((bell) => bell.id)).toEqual(["a", "d"]);
	});

	it("includes only outdoor bells when placement is outdoors", () => {
		const result = filterBells(sampleBells, {
			counties: [],
			placement: "outdoors",
			maxDistanceMiles: null,
		});
		expect(result.map((bell) => bell.id)).toEqual(["b"]);
	});

	it("excludes unknown placement for indoor and outdoor filters", () => {
		const indoors = filterBells(sampleBells, {
			counties: [],
			placement: "indoors",
			maxDistanceMiles: null,
		});
		const outdoors = filterBells(sampleBells, {
			counties: [],
			placement: "outdoors",
			maxDistanceMiles: null,
		});
		expect(indoors.some((bell) => bell.id === "c")).toBe(false);
		expect(outdoors.some((bell) => bell.id === "c")).toBe(false);
	});

	it("combines county and placement filters", () => {
		const result = filterBells(sampleBells, {
			counties: ["York"],
			placement: "indoors",
			maxDistanceMiles: null,
		});
		expect(result.map((bell) => bell.id)).toEqual(["a"]);
	});
});

describe("filterBells distance radius", () => {
	// Two bells near Harrisburg, one far away near Pittsburgh (~170 miles).
	const distanceBells: Bell[] = [
		makeBell({ id: "near", county: "Dauphin", lat: 40.2732, lng: -76.8867 }),
		makeBell({ id: "close", county: "Cumberland", lat: 40.2, lng: -77.2 }),
		makeBell({ id: "far", county: "Allegheny", lat: 40.4406, lng: -79.9959 }),
	];
	const harrisburg = { lat: 40.2732, lng: -76.8867 };

	it("keeps only bells within the radius when an origin is known", () => {
		const result = filterBells(
			distanceBells,
			{ counties: [], placement: "all", maxDistanceMiles: 50 },
			harrisburg,
		);
		expect(result.map((bell) => bell.id)).toEqual(["near", "close"]);
	});

	it("does not restrict by distance until the origin is available", () => {
		const result = filterBells(
			distanceBells,
			{ counties: [], placement: "all", maxDistanceMiles: 50 },
			null,
		);
		expect(result.map((bell) => bell.id)).toEqual(["near", "close", "far"]);
	});

	it("ignores the origin when no radius is selected", () => {
		const result = filterBells(
			distanceBells,
			{ counties: [], placement: "all", maxDistanceMiles: null },
			harrisburg,
		);
		expect(result).toHaveLength(3);
	});
});
