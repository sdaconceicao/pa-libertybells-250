import { describe, expect, it } from "vitest";
import {
	DEFAULT_VISITED_FILTER,
	matchesVisited,
	visitedFilterIsDefault,
} from "./visitedFilter";

describe("visitedFilter", () => {
	it("defaults to showing every state", () => {
		expect(DEFAULT_VISITED_FILTER).toEqual({
			none: true,
			want: true,
			been: true,
		});
		expect(visitedFilterIsDefault(DEFAULT_VISITED_FILTER)).toBe(true);
	});

	it("is not default when any state is disabled", () => {
		expect(
			visitedFilterIsDefault({ none: true, want: true, been: false }),
		).toBe(false);
		expect(
			visitedFilterIsDefault({ none: false, want: true, been: true }),
		).toBe(false);
	});

	it("matches a status only when its checkbox is enabled", () => {
		const filter = { none: false, want: true, been: false };

		expect(matchesVisited("want", filter)).toBe(true);
		expect(matchesVisited("been", filter)).toBe(false);
		expect(matchesVisited("none", filter)).toBe(false);
	});
});
