import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./SegmentedControl";

describe("SegmentedControl", () => {
	const options = [
		{ value: "all", label: "All" },
		{ value: "outdoors", label: "Outdoor" },
		{ value: "indoors", label: "Indoor" },
	];

	afterEach(() => {
		cleanup();
	});

	it("renders options and selects the current value", () => {
		render(
			<SegmentedControl
				options={options}
				value="all"
				onChange={vi.fn()}
				ariaLabel="Placement"
			/>,
		);

		expect(
			screen.getByRole("tab", { name: "All" }).getAttribute("aria-selected"),
		).toBe("true");
		expect(
			screen
				.getByRole("tab", { name: "Outdoor" })
				.getAttribute("aria-selected"),
		).toBe("false");
	});

	it("calls onChange when an option is selected", () => {
		const onChange = vi.fn();

		render(
			<SegmentedControl
				options={options}
				value="all"
				onChange={onChange}
				ariaLabel="Placement"
			/>,
		);

		fireEvent.click(screen.getByRole("tab", { name: "Indoor" }));

		expect(onChange).toHaveBeenCalledWith("indoors");
	});

	it("shows helper text when provided", () => {
		render(
			<SegmentedControl
				options={options}
				value="indoors"
				onChange={vi.fn()}
				ariaLabel="Placement"
				helperText="Bells without indoor/outdoor information are hidden."
			/>,
		);

		expect(
			screen.getByText("Bells without indoor/outdoor information are hidden."),
		).not.toBeNull();
	});
});
