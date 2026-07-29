import { type Coordinates, milesBetween } from "../geolocation/geolocation";
import type { Bell } from "./types";

export type PlacementFilter = "all" | "indoors" | "outdoors";

export type BellFilters = {
	/** Empty = all counties */
	counties: string[];
	placement: PlacementFilter;
	/** `null` = any distance; otherwise the max crow-flies miles from the user. */
	maxDistanceMiles: number | null;
};

/**
 * Selectable "miles away" thresholds, in ascending order. Capped at 250 so the
 * radius stays meaningful within Pennsylvania.
 */
export const DISTANCE_OPTIONS_MILES = [10, 25, 50, 100, 250] as const;

export const DEFAULT_BELL_FILTERS: BellFilters = {
	counties: [],
	placement: "all",
	maxDistanceMiles: null,
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
	if (a.maxDistanceMiles !== b.maxDistanceMiles) {
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

function matchesDistance(
	bell: Bell,
	maxDistanceMiles: number | null,
	origin: Coordinates | null,
): boolean {
	// No radius chosen, or the user's location isn't known yet: don't restrict.
	if (maxDistanceMiles == null || origin == null) {
		return true;
	}
	return (
		milesBetween(origin, { lat: bell.lat, lng: bell.lng }) <= maxDistanceMiles
	);
}

export function filterBells(
	bells: Bell[],
	filters: BellFilters,
	origin: Coordinates | null = null,
): Bell[] {
	return bells.filter(
		(bell) =>
			matchesCounty(bell, filters.counties) &&
			matchesPlacement(bell, filters.placement) &&
			matchesDistance(bell, filters.maxDistanceMiles, origin),
	);
}
