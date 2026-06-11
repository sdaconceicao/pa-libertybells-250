import type { Bell } from "../../lib/bells/types";

export type BellNavigation = {
	previousId: string | null;
	nextId: string | null;
	position: number | null;
	total: number;
};

export function getBellNavigation(
	bells: Bell[],
	currentId: string,
): BellNavigation {
	const index = bells.findIndex((bell) => bell.id === currentId);
	const total = bells.length;

	if (index === -1) {
		return { previousId: null, nextId: null, position: null, total };
	}

	return {
		previousId: bells[index - 1]?.id ?? null,
		nextId: bells[index + 1]?.id ?? null,
		position: index + 1,
		total,
	};
}
