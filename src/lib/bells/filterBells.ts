import type { Bell } from "./types";

export type PlacementFilter = "all" | "indoors" | "outdoors";

export type BellFilters = {
	/** Empty = all counties */
	counties: string[];
	placement: PlacementFilter;
};

export const DEFAULT_BELL_FILTERS: BellFilters = {
	counties: [],
	placement: "all",
};

export function getCountyOptions(bells: Bell[]): string[] {
	const counties = new Set(bells.map((bell) => bell.county));
	return [...counties].sort((a, b) => a.localeCompare(b));
}

export function filtersAreDefault(filters: BellFilters): boolean {
	return filtersEqual(filters, DEFAULT_BELL_FILTERS);
}

export function filtersEqual(a: BellFilters, b: BellFilters): boolean {
	if (a.placement !== b.placement) {
		return false;
	}
	if (a.counties.length !== b.counties.length) {
		return false;
	}
	const sortedA = [...a.counties].sort((x, y) => x.localeCompare(y));
	const sortedB = [...b.counties].sort((x, y) => x.localeCompare(y));
	return sortedA.every((county, index) => county === sortedB[index]);
}

function matchesPlacement(bell: Bell, placement: PlacementFilter): boolean {
	if (placement === "all") {
		return true;
	}
	return bell.placement === placement;
}

function matchesCounty(bell: Bell, counties: string[]): boolean {
	if (counties.length === 0) {
		return true;
	}
	return counties.includes(bell.county);
}

export function filterBells(bells: Bell[], filters: BellFilters): Bell[] {
	return bells.filter(
		(bell) =>
			matchesCounty(bell, filters.counties) &&
			matchesPlacement(bell, filters.placement),
	);
}
