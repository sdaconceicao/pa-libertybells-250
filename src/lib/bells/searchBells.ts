import type { Bell } from "./types";

export function searchBells(bells: Bell[], query: string): Bell[] {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return [];
	}

	return bells.filter(
		(bell) =>
			bell.title.toLowerCase().includes(normalized) ||
			(bell.artist?.toLowerCase().includes(normalized) ?? false),
	);
}
