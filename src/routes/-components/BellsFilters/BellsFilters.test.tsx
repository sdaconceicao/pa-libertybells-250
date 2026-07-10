import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_BELL_FILTERS } from "../../../lib/bells/filterBells";
import { DEFAULT_VISITED_FILTER } from "../../../lib/visits/visitedFilter";
import { BellsFilters } from "./BellsFilters";

describe("BellsFilters", () => {
	const defaultProps = {
		countyOptions: ["Adams", "York"],
		draft: DEFAULT_BELL_FILTERS,
		applied: DEFAULT_BELL_FILTERS,
		onDraftChange: vi.fn(),
		onApply: vi.fn(),
		onClear: vi.fn(),
		resultSummary: null,
		showVisitedFilter: false,
		visitedFilter: DEFAULT_VISITED_FILTER,
		appliedVisitedFilter: DEFAULT_VISITED_FILTER,
		onVisitedFilterChange: vi.fn(),
	};

	afterEach(() => {
		cleanup();
	});

	it("disables apply until draft differs from applied", () => {
		render(<BellsFilters {...defaultProps} />);

		expect(
			(
				screen.getByRole("button", {
					name: "Apply filters",
				}) as HTMLButtonElement
			).disabled,
		).toBe(true);
	});

	it("enables apply when draft changes", () => {
		render(
			<BellsFilters
				{...defaultProps}
				draft={{ counties: ["York"], placement: "all" }}
			/>,
		);

		expect(
			(
				screen.getByRole("button", {
					name: "Apply filters",
				}) as HTMLButtonElement
			).disabled,
		).toBe(false);
	});

	it("shows placement helper when not showing all bells", () => {
		const { rerender } = render(<BellsFilters {...defaultProps} />);

		expect(
			screen.queryByText(
				"Bells without indoor/outdoor information are hidden.",
			),
		).toBeNull();

		rerender(
			<BellsFilters
				{...defaultProps}
				draft={{ counties: [], placement: "indoors" }}
			/>,
		);

		expect(
			screen.getByText("Bells without indoor/outdoor information are hidden."),
		).not.toBeNull();
	});

	it("calls onApply when apply is clicked", () => {
		const onApply = vi.fn();

		render(
			<BellsFilters
				{...defaultProps}
				draft={{ counties: ["York"], placement: "all" }}
				onApply={onApply}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

		expect(onApply).toHaveBeenCalledTimes(1);
	});

	it("calls onClear when clear is clicked", () => {
		const onClear = vi.fn();

		render(
			<BellsFilters
				{...defaultProps}
				applied={{ counties: ["York"], placement: "indoors" }}
				onClear={onClear}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

		expect(onClear).toHaveBeenCalledTimes(1);
	});

	it("shows result summary when provided", () => {
		render(
			<BellsFilters {...defaultProps} resultSummary="Showing 2 of 86 bells" />,
		);

		expect(screen.getByText("Showing 2 of 86 bells")).not.toBeNull();
	});
});
