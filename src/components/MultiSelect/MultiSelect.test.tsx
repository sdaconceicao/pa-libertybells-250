import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect";

describe("MultiSelect", () => {
	const options = [
		{ value: "adams", label: "Adams" },
		{ value: "york", label: "York" },
		{ value: "lancaster", label: "Lancaster" },
	];

	const defaultProps = {
		options,
		selectedValues: [] as string[],
		onChange: vi.fn(),
		emptySelectionLabel: "All counties",
		multipleSelectionLabel: (count: number) => `${count} counties selected`,
		searchLabel: "Search counties",
		emptySearchLabel: "No counties match your search.",
	};

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows empty selection label when nothing is selected", () => {
		render(<MultiSelect {...defaultProps} />);

		expect(
			screen.getByRole("button", { name: "All counties" }),
		).not.toBeNull();
	});

	it("shows the selected option label when one value is selected", () => {
		render(<MultiSelect {...defaultProps} selectedValues={["york"]} />);

		expect(screen.getByRole("button", { name: "York" })).not.toBeNull();
	});

	it("shows multiple selection label when more than one value is selected", () => {
		render(
			<MultiSelect {...defaultProps} selectedValues={["adams", "york"]} />,
		);

		expect(
			screen.getByRole("button", { name: "2 counties selected" }),
		).not.toBeNull();
	});

	it("opens and closes the panel from the trigger", () => {
		render(<MultiSelect {...defaultProps} />);

		const trigger = screen.getByRole("button", { name: "All counties" });

		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("true");
		expect(screen.getByLabelText("Search counties")).not.toBeNull();

		fireEvent.click(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
		expect(screen.queryByLabelText("Search counties")).toBeNull();
	});

	it("selects an option", () => {
		const onChange = vi.fn();

		render(<MultiSelect {...defaultProps} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Adams" }));

		expect(onChange).toHaveBeenCalledWith(["adams"]);
	});

	it("deselects an option", () => {
		const onChange = vi.fn();

		render(
			<MultiSelect
				{...defaultProps}
				selectedValues={["adams"]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Adams" }));
		fireEvent.click(screen.getByRole("checkbox", { name: "Adams" }));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("selects all options", () => {
		const onChange = vi.fn();

		render(<MultiSelect {...defaultProps} onChange={onChange} />);

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));
		fireEvent.click(screen.getByRole("button", { name: "Select all" }));

		expect(onChange).toHaveBeenCalledWith(["adams", "york", "lancaster"]);
	});

	it("clears the selection", () => {
		const onChange = vi.fn();

		render(
			<MultiSelect
				{...defaultProps}
				selectedValues={["adams", "york"]}
				onChange={onChange}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "2 counties selected" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	it("filters options by label and value", () => {
		render(<MultiSelect {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));

		expect(screen.getByRole("checkbox", { name: "Adams" })).not.toBeNull();
		expect(screen.getByRole("checkbox", { name: "York" })).not.toBeNull();
		expect(screen.getByRole("checkbox", { name: "Lancaster" })).not.toBeNull();

		fireEvent.change(screen.getByLabelText("Search counties"), {
			target: { value: "york" },
		});

		expect(screen.queryByRole("checkbox", { name: "Adams" })).toBeNull();
		expect(screen.getByRole("checkbox", { name: "York" })).not.toBeNull();
		expect(screen.queryByRole("checkbox", { name: "Lancaster" })).toBeNull();
	});

	it("shows empty search message when no options match", () => {
		render(<MultiSelect {...defaultProps} />);

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));
		fireEvent.change(screen.getByLabelText("Search counties"), {
			target: { value: "zzzz" },
		});

		expect(
			screen.getByText("No counties match your search."),
		).not.toBeNull();
	});

	it("closes when clicking outside or pressing Escape", () => {
		render(
			<div>
				<MultiSelect {...defaultProps} />
				<button type="button">Outside</button>
			</div>,
		);

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));
		expect(screen.getByLabelText("Search counties")).not.toBeNull();

		fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
		expect(screen.queryByLabelText("Search counties")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "All counties" }));
		expect(screen.getByLabelText("Search counties")).not.toBeNull();

		fireEvent.keyDown(document, { key: "Escape" });
		expect(screen.queryByLabelText("Search counties")).toBeNull();
	});
});
