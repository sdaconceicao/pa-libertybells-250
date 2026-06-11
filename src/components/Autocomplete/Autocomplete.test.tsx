import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import styles from "./Autocomplete.module.css";
import { Autocomplete } from "./Autocomplete";

type Item = {
	id: string;
	label: string;
};

function AutocompleteHarness({
	initialValue = "",
	items,
	onSelect,
	emptyMessage,
}: {
	initialValue?: string;
	items: Item[];
	onSelect?: (item: Item) => void;
	emptyMessage?: string;
}) {
	const [value, setValue] = useState(initialValue);

	return (
		<Autocomplete
			value={value}
			onValueChange={setValue}
			items={items}
			getItemKey={(item) => item.id}
			label="Search items"
			resultsLabel="Search results"
			emptyMessage={emptyMessage}
			onSelect={onSelect}
			renderResults={({
				items: resultItems,
				activeIndex,
				getOptionId,
				getOptionClassName,
				onActiveIndexChange,
				onSelect,
			}) =>
				resultItems.map((item, index) => (
					<div
						key={item.id}
						id={getOptionId(index)}
						className={getOptionClassName(index)}
						role="option"
						tabIndex={-1}
						aria-selected={index === activeIndex}
						onMouseEnter={() => onActiveIndexChange(index)}
						onClick={() => onSelect(item)}
						onKeyDown={(event) => {
							if (event.key !== "Enter" && event.key !== " ") {
								return;
							}
							event.preventDefault();
							onSelect(item);
						}}
					>
						{item.label}
					</div>
				))
			}
		/>
	);
}

describe("Autocomplete", () => {
	beforeEach(() => {
		if (!HTMLElement.prototype.scrollIntoView) {
			HTMLElement.prototype.scrollIntoView = vi.fn();
		}
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("renders a combobox input", () => {
		render(
			<Autocomplete<Item>
				value=""
				onValueChange={vi.fn()}
				items={[]}
				getItemKey={(item) => item.id}
				label="Search items"
				resultsLabel="Search results"
				renderResults={() => null}
			/>,
		);

		expect(
			screen.getByRole("combobox", { name: "Search items" }),
		).not.toBeNull();
	});

	it("shows custom results from renderResults", () => {
		const items: Item[] = [
			{ id: "a", label: "Alpha" },
			{ id: "b", label: "Beta" },
		];

		render(<AutocompleteHarness items={items} />);

		fireEvent.change(screen.getByRole("combobox", { name: "Search items" }), {
			target: { value: "a" },
		});

		expect(
			screen.getByRole("listbox", { name: "Search results" }),
		).not.toBeNull();
		expect(screen.getByText("Alpha")).not.toBeNull();
		expect(screen.getByText("Beta")).not.toBeNull();
	});

	it("moves active option with arrow keys and selects with enter", () => {
		const onSelect = vi.fn();
		const items: Item[] = [
			{ id: "a", label: "Alpha" },
			{ id: "b", label: "Beta" },
		];

		render(<AutocompleteHarness items={items} onSelect={onSelect} />);

		const input = screen.getByRole("combobox", { name: "Search items" });
		fireEvent.change(input, { target: { value: "a" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(input.getAttribute("aria-activedescendant")).toContain("a");
		expect(screen.getByRole("option", { name: "Alpha" }).className).toContain(
			styles.optionActive,
		);

		fireEvent.keyDown(input, { key: "ArrowDown" });
		expect(input.getAttribute("aria-activedescendant")).toContain("b");

		fireEvent.keyDown(input, { key: "Enter" });
		expect(onSelect).toHaveBeenCalledWith(items[1]);
	});

	it("scrolls the active option into view when navigating with arrow keys", () => {
		const scrollIntoView = vi
			.spyOn(HTMLElement.prototype, "scrollIntoView")
			.mockImplementation(() => {});
		const items: Item[] = Array.from({ length: 12 }, (_, index) => ({
			id: `item-${index}`,
			label: `Item ${index}`,
		}));

		render(<AutocompleteHarness items={items} />);

		const input = screen.getByRole("combobox", { name: "Search items" });
		fireEvent.change(input, { target: { value: "item" } });
		fireEvent.keyDown(input, { key: "ArrowDown" });
		fireEvent.keyDown(input, { key: "ArrowDown" });

		expect(scrollIntoView).toHaveBeenCalled();
	});

	it("shows an empty message when there are no items", () => {
		render(<AutocompleteHarness items={[]} emptyMessage="Nothing found" />);

		fireEvent.change(screen.getByRole("combobox", { name: "Search items" }), {
			target: { value: "missing" },
		});

		expect(screen.getByText("Nothing found")).not.toBeNull();
	});
});
