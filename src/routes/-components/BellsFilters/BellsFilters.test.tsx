import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
		onRequestLocation: vi.fn(),
		locationStatus: "idle" as const,
		locationError: null,
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
				draft={{ counties: ["York"], placement: "all", maxDistanceMiles: null }}
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
				draft={{ counties: [], placement: "indoors", maxDistanceMiles: null }}
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
				draft={{ counties: ["York"], placement: "all", maxDistanceMiles: null }}
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
				applied={{
					counties: ["York"],
					placement: "indoors",
					maxDistanceMiles: null,
				}}
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

	it("defaults the distance dropdown to any distance", () => {
		render(<BellsFilters {...defaultProps} />);

		const distance = screen.getByRole("combobox", {
			name: "Distance from my location",
		}) as HTMLInputElement;
		// The Lago Select is a react-aria combobox; its input reflects the label
		// of the selected key ("any"), not the key itself.
		expect(distance.value).toBe("Any distance");
	});

	it("updates the draft and requests location when a radius is chosen", async () => {
		const user = userEvent.setup();
		const onDraftChange = vi.fn();
		const onRequestLocation = vi.fn();

		render(
			<BellsFilters
				{...defaultProps}
				onDraftChange={onDraftChange}
				onRequestLocation={onRequestLocation}
			/>,
		);

		await user.click(
			screen.getByRole("combobox", { name: "Distance from my location" }),
		);
		await user.click(
			await screen.findByRole("option", { name: "Within 50 miles" }),
		);

		expect(onDraftChange).toHaveBeenCalledWith({
			...DEFAULT_BELL_FILTERS,
			maxDistanceMiles: 50,
		});
		expect(onRequestLocation).toHaveBeenCalledTimes(1);
	});

	it("does not request location again once a fix is ready", async () => {
		const user = userEvent.setup();
		const onRequestLocation = vi.fn();

		render(
			<BellsFilters
				{...defaultProps}
				locationStatus="ready"
				onRequestLocation={onRequestLocation}
			/>,
		);

		await user.click(
			screen.getByRole("combobox", { name: "Distance from my location" }),
		);
		await user.click(
			await screen.findByRole("option", { name: "Within 25 miles" }),
		);

		expect(onRequestLocation).not.toHaveBeenCalled();
	});

	it("surfaces a location error message on the distance filter", () => {
		render(
			<BellsFilters
				{...defaultProps}
				draft={{
					counties: [],
					placement: "all",
					maxDistanceMiles: 25,
				}}
				locationStatus="error"
				locationError="Location access is blocked."
			/>,
		);

		expect(screen.getByRole("alert").textContent).toContain(
			"Location access is blocked.",
		);
	});
});
