import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_BELL_FILTERS } from "../../../lib/bells/filterBells";
import type { Bell } from "../../../lib/bells/types";
import { DEFAULT_VISITED_FILTER } from "../../../lib/visits/visitedFilter";
import { BellsPanelContent } from "./BellsPanelContent";

vi.mock("../BellsList/BellsList", () => ({
	BellsList: () => <div>Bell list</div>,
}));

vi.mock("../BellsFilters/BellsFilters", () => ({
	BellsFilters: () => <div>Filters</div>,
}));

vi.mock("../BellPopupContent/BellPopupContent", () => ({
	BellPopupContent: () => <div>Selected bell</div>,
}));

function makeBell(id: string, title: string): Bell {
	return {
		id,
		county: "York",
		title,
		address: { city: "York", zip: "17401" },
		sourceSlug: id,
		lat: 40,
		lng: -77,
	};
}

const bells = [makeBell("a", "Bell A"), makeBell("b", "Bell B")];

const defaultFilterProps = {
	countyOptions: ["York"],
	draft: DEFAULT_BELL_FILTERS,
	applied: DEFAULT_BELL_FILTERS,
	onDraftChange: () => {},
	onApply: () => {},
	onClear: () => {},
	resultSummary: null,
	showVisitedFilter: false,
	visitedFilter: DEFAULT_VISITED_FILTER,
	appliedVisitedFilter: DEFAULT_VISITED_FILTER,
	onVisitedFilterChange: () => {},
	onRequestLocation: () => {},
	locationStatus: "idle" as const,
	locationError: null,
};

const defaultSelectionProps = {
	selectedBell: null,
	bellNavigation: null,
	onClearSelection: () => {},
	onPreviousBell: () => {},
	onNextBell: () => {},
};

describe("BellsPanelContent", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows filters and list when nothing is selected", () => {
		render(
			<BellsPanelContent
				bells={bells}
				hasActiveFilters={false}
				onBellHover={() => {}}
				onBellSelect={() => {}}
				filtersPlacement="replace"
				{...defaultFilterProps}
				{...defaultSelectionProps}
			/>,
		);

		expect(screen.getByText("Filters")).toBeTruthy();
		expect(screen.getByText("Bell list")).toBeTruthy();
	});

	it("replaces filters with selected content in replace mode", () => {
		render(
			<BellsPanelContent
				bells={bells}
				hasActiveFilters={false}
				onBellHover={() => {}}
				onBellSelect={() => {}}
				filtersPlacement="replace"
				{...defaultFilterProps}
				{...defaultSelectionProps}
				selectedBell={bells[0]}
				bellNavigation={{
					previousId: null,
					nextId: "b",
					position: 1,
					total: 2,
				}}
			/>,
		);

		expect(screen.getByText("Selected bell")).toBeTruthy();
		expect(screen.queryByText("Filters")).toBeNull();
		expect(screen.getByText("Bell list")).toBeTruthy();
	});

	it("keeps filters visible above the list in stack mode", () => {
		render(
			<BellsPanelContent
				bells={bells}
				hasActiveFilters={false}
				onBellHover={() => {}}
				onBellSelect={() => {}}
				filtersPlacement="stack"
				{...defaultFilterProps}
				{...defaultSelectionProps}
				selectedBell={bells[0]}
				bellNavigation={{
					previousId: null,
					nextId: "b",
					position: 1,
					total: 2,
				}}
			/>,
		);

		expect(screen.getByText("Selected bell")).toBeTruthy();
		expect(screen.getByText("Filters")).toBeTruthy();
		expect(screen.getByText("Bell list")).toBeTruthy();
	});
});
