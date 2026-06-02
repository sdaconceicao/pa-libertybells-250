import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Bell } from "../../lib/bells/types";
import { useBellsFilters } from "./useBellsFilters";

function makeBell(
	overrides: Partial<Bell> & Pick<Bell, "id" | "county">,
): Bell {
	return {
		id: overrides.id,
		county: overrides.county,
		title: "Test Bell",
		currentAddress: "123 Main St",
		sourceSlug: "test",
		lat: 40,
		lng: -77,
		...overrides,
	};
}

const bells: Bell[] = [
	makeBell({ id: "a", county: "York", placement: "indoors" }),
	makeBell({ id: "b", county: "Adams", placement: "outdoors" }),
	makeBell({ id: "c", county: "York" }),
];

describe("useBellsFilters", () => {
	it("starts with all bells visible", () => {
		const { result } = renderHook(() => useBellsFilters(bells));

		expect(result.current.filteredBells).toHaveLength(3);
		expect(result.current.hasActiveFilters).toBe(false);
		expect(result.current.resultSummary).toBeNull();
	});

	it("does not filter until apply is called", () => {
		const { result } = renderHook(() => useBellsFilters(bells));

		act(() => {
			result.current.setDraft({
				counties: ["York"],
				placement: "all",
			});
		});

		expect(result.current.filteredBells).toHaveLength(3);

		act(() => {
			result.current.applyFilters();
		});

		expect(result.current.filteredBells).toHaveLength(2);
		expect(result.current.hasActiveFilters).toBe(true);
		expect(result.current.resultSummary).toBe("Showing 2 of 3 bells");
	});

	it("clear resets draft and applied filters", () => {
		const { result } = renderHook(() => useBellsFilters(bells));

		act(() => {
			result.current.setDraft({
				counties: ["Adams"],
				placement: "outdoors",
			});
		});

		act(() => {
			result.current.applyFilters();
		});

		expect(result.current.filteredBells).toHaveLength(1);

		act(() => {
			result.current.clearFilters();
		});

		expect(result.current.filteredBells).toHaveLength(3);
		expect(result.current.draft).toEqual({
			counties: [],
			placement: "all",
		});
		expect(result.current.applied).toEqual({
			counties: [],
			placement: "all",
		});
	});

	it("exposes sorted county options from the bell list", () => {
		const { result } = renderHook(() => useBellsFilters(bells));

		expect(result.current.countyOptions).toEqual(["Adams", "York"]);
	});
});
