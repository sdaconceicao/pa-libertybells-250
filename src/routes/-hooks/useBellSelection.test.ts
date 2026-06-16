import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../lib/bells/types";
import { useBellSelection } from "./useBellSelection";

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

const bells: Bell[] = [
	makeBell({ id: "a", county: "York" }),
	makeBell({ id: "b", county: "Adams" }),
	makeBell({ id: "c", county: "York" }),
];

describe("useBellSelection", () => {
	const showMap = vi.fn();
	const showList = vi.fn();

	const renderSelection = (
		overrides?: Partial<Parameters<typeof useBellSelection>[0]>,
	) =>
		renderHook(() =>
			useBellSelection({
				filteredBells: bells,
				isMobile: false,
				mobileView: "list",
				showMap,
				showList,
				...overrides,
			}),
		);

	beforeEach(() => {
		showMap.mockClear();
		showList.mockClear();
	});

	it("starts with no selection", () => {
		const { result } = renderSelection();

		expect(result.current.selectedBellId).toBeNull();
		expect(result.current.selectedBell).toBeNull();
		expect(result.current.bellNavigation).toBeNull();
	});

	it("selects a bell on desktop without changing mobile view", () => {
		const { result } = renderSelection();

		act(() => {
			result.current.handleBellSelect("b");
		});

		expect(result.current.selectedBellId).toBe("b");
		expect(result.current.selectedBell?.id).toBe("b");
		expect(showList).not.toHaveBeenCalled();
	});

	it("selects a bell on mobile and switches to list view", () => {
		const { result } = renderSelection({ isMobile: true, mobileView: "map" });

		act(() => {
			result.current.handleBellSelect("a");
		});

		expect(result.current.selectedBellId).toBe("a");
		expect(showList).toHaveBeenCalledTimes(1);
	});

	it("clears selection on desktop", () => {
		const { result } = renderSelection();

		act(() => {
			result.current.handleBellSelect("c");
		});

		act(() => {
			result.current.handleClearSelection();
		});

		expect(result.current.selectedBellId).toBeNull();
		expect(showMap).not.toHaveBeenCalled();
	});

	it("returns to map when clearing selection opened from map on mobile", () => {
		const { result } = renderSelection({ isMobile: true, mobileView: "map" });

		act(() => {
			result.current.handleBellSelect("a");
		});

		act(() => {
			result.current.handleClearSelection();
		});

		expect(result.current.selectedBellId).toBeNull();
		expect(showMap).toHaveBeenCalledTimes(1);
	});

	it("navigates between bells", () => {
		const { result } = renderSelection();

		act(() => {
			result.current.handleBellSelect("b");
		});

		expect(result.current.bellNavigation?.position).toBe(2);
		expect(result.current.bellNavigation?.previousId).toBe("a");
		expect(result.current.bellNavigation?.nextId).toBe("c");

		act(() => {
			result.current.handlePreviousBell();
		});

		expect(result.current.selectedBellId).toBe("a");

		act(() => {
			result.current.handleNextBell();
		});

		expect(result.current.selectedBellId).toBe("b");
	});

	it("calls highlight ref on hover", () => {
		const { result } = renderSelection();
		const highlight = vi.fn();

		act(() => {
			result.current.highlightBellRef.current = highlight;
		});

		act(() => {
			result.current.handleBellHover("c");
		});

		expect(highlight).toHaveBeenCalledWith("c");
	});

	it("resets mobile close flag when showing list explicitly", () => {
		const { result } = renderSelection({ isMobile: true, mobileView: "map" });

		act(() => {
			result.current.handleBellSelect("a");
		});

		act(() => {
			result.current.handleShowList();
		});

		act(() => {
			result.current.handleClearSelection();
		});

		expect(showMap).not.toHaveBeenCalled();
	});
});
