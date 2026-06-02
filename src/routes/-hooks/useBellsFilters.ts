import { useCallback, useMemo, useState } from "react";
import {
	DEFAULT_BELL_FILTERS,
	type BellFilters,
	filterBells,
	filtersAreDefault,
	getCountyOptions,
} from "../../lib/bells/filterBells";
import type { Bell } from "../../lib/bells/types";

export function useBellsFilters(bells: Bell[]) {
	const [draft, setDraft] = useState<BellFilters>(DEFAULT_BELL_FILTERS);
	const [applied, setApplied] = useState<BellFilters>(DEFAULT_BELL_FILTERS);

	const countyOptions = useMemo(() => getCountyOptions(bells), [bells]);

	const filteredBells = useMemo(
		() => filterBells(bells, applied),
		[bells, applied],
	);

	const hasActiveFilters = !filtersAreDefault(applied);

	const resultSummary = hasActiveFilters
		? `Showing ${filteredBells.length} of ${bells.length} bells`
		: null;

	const applyFilters = useCallback(() => {
		setApplied(draft);
	}, [draft]);

	const clearFilters = useCallback(() => {
		setDraft(DEFAULT_BELL_FILTERS);
		setApplied(DEFAULT_BELL_FILTERS);
	}, []);

	return {
		draft,
		applied,
		setDraft,
		applyFilters,
		clearFilters,
		countyOptions,
		filteredBells,
		hasActiveFilters,
		resultSummary,
	};
}
