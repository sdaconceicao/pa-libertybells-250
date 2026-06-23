import type { VisitStatus } from "./types";

/**
 * Which visit states are currently shown. Each key maps to a checkbox in the
 * "Visited" filter row. By default all three are enabled, so every bell shows.
 */
export type VisitedFilter = Record<VisitStatus, boolean>;

export const DEFAULT_VISITED_FILTER: VisitedFilter = {
	none: true,
	want: true,
	been: true,
};

/** True when every state is enabled (the filter hides nothing). */
export function visitedFilterIsDefault(filter: VisitedFilter): boolean {
	return filter.none && filter.want && filter.been;
}

export function visitedFiltersEqual(
	a: VisitedFilter,
	b: VisitedFilter,
): boolean {
	return a.none === b.none && a.want === b.want && a.been === b.been;
}

export function matchesVisited(
	status: VisitStatus,
	filter: VisitedFilter,
): boolean {
	return filter[status];
}
