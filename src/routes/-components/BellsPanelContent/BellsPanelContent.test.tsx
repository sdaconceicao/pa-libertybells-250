import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Bell } from "../../../lib/bells/types";
import { BellsPanelContent } from "./BellsPanelContent";

vi.mock("../BellsList/BellsList", () => ({
	BellsList: () => <div>Bell list</div>,
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

describe("BellsPanelContent", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows filters and list when nothing is selected", () => {
		render(
			<BellsPanelContent
				bells={bells}
				emptyMessage="No bells"
				onBellHover={() => {}}
				onBellSelect={() => {}}
				selectedContent={null}
				filtersPanel={<div>Filters</div>}
				filtersPlacement="replace"
			/>,
		);

		expect(screen.getByText("Filters")).toBeTruthy();
		expect(screen.getByText("Bell list")).toBeTruthy();
	});

	it("replaces filters with selected content in replace mode", () => {
		render(
			<BellsPanelContent
				bells={bells}
				emptyMessage="No bells"
				onBellHover={() => {}}
				onBellSelect={() => {}}
				selectedContent={<div>Selected bell</div>}
				filtersPanel={<div>Filters</div>}
				filtersPlacement="replace"
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
				emptyMessage="No bells"
				onBellHover={() => {}}
				onBellSelect={() => {}}
				selectedContent={<div>Selected bell</div>}
				filtersPanel={<div>Filters</div>}
				filtersPlacement="stack"
			/>,
		);

		expect(screen.getByText("Selected bell")).toBeTruthy();
		expect(screen.getByText("Filters")).toBeTruthy();
		expect(screen.getByText("Bell list")).toBeTruthy();
	});
});
