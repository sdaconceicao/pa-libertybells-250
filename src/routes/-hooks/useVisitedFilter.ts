import { useCallback, useState } from "react";
import type { Bell } from "../../lib/bells/types";
import { useVisitStatuses } from "../../lib/visits/VisitStatusContext";
import {
	DEFAULT_VISITED_FILTER,
	matchesVisited,
	type VisitedFilter,
	visitedFilterIsDefault,
} from "../../lib/visits/visitedFilter";

/**
 * Lets a signed-in user filter the map/list by their saved visit status
 * (want to go / been there / neither). Mirrors the draft/applied flow of the
 * other filters: checkbox edits update `draft` and only take effect once
 * `applyVisited` runs. A no-op for signed-out users or while every option is
 * enabled (the default).
 */
export function useVisitedFilter() {
	const { isAuthed, getStatus } = useVisitStatuses();
	const [draft, setDraft] = useState<VisitedFilter>(DEFAULT_VISITED_FILTER);
	const [applied, setApplied] = useState<VisitedFilter>(DEFAULT_VISITED_FILTER);

	const applyVisited = useCallback(() => {
		setApplied(draft);
	}, [draft]);

	const clearVisited = useCallback(() => {
		setDraft(DEFAULT_VISITED_FILTER);
		setApplied(DEFAULT_VISITED_FILTER);
	}, []);

	const applyVisitedFilter = useCallback(
		(bells: Bell[]): Bell[] => {
			if (!isAuthed || visitedFilterIsDefault(applied)) {
				return bells;
			}
			return bells.filter((bell) =>
				matchesVisited(getStatus(bell.id), applied),
			);
		},
		[isAuthed, applied, getStatus],
	);

	return {
		isAuthed,
		draft,
		applied,
		setDraft,
		applyVisited,
		clearVisited,
		applyVisitedFilter,
	};
}
