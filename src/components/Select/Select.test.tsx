import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select, type SelectOption } from "./Select";

const OPTIONS: SelectOption<string>[] = [
	{ value: "", label: "Pick one" },
	{ value: "a", label: "Apple" },
	{ value: "b", label: "Banana" },
];

describe("Select", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders all options and reflects the value", () => {
		render(
			<Select
				value="a"
				onChange={() => {}}
				options={OPTIONS}
				ariaLabel="Fruit"
			/>,
		);

		const select = screen.getByRole("combobox", { name: "Fruit" });
		expect((select as HTMLSelectElement).value).toBe("a");
		expect(screen.getByRole("option", { name: "Pick one" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "Apple" })).toBeTruthy();
		expect(screen.getByRole("option", { name: "Banana" })).toBeTruthy();
	});

	it("calls onChange with the chosen value", () => {
		const onChange = vi.fn();
		render(
			<Select
				value="a"
				onChange={onChange}
				options={OPTIONS}
				ariaLabel="Fruit"
			/>,
		);

		fireEvent.change(screen.getByRole("combobox", { name: "Fruit" }), {
			target: { value: "b" },
		});

		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("applies the placeholder style only when the placeholder value is selected", () => {
		const { rerender } = render(
			<Select
				value=""
				onChange={() => {}}
				options={OPTIONS}
				ariaLabel="Fruit"
				placeholderValue=""
			/>,
		);

		const select = screen.getByRole("combobox", { name: "Fruit" });
		expect(select.className).toMatch(/placeholder/);

		rerender(
			<Select
				value="a"
				onChange={() => {}}
				options={OPTIONS}
				ariaLabel="Fruit"
				placeholderValue=""
			/>,
		);
		expect(
			screen.getByRole("combobox", { name: "Fruit" }).className,
		).not.toMatch(/placeholder/);
	});

	it("is disabled when disabled is set", () => {
		render(
			<Select
				value="a"
				onChange={() => {}}
				options={OPTIONS}
				ariaLabel="Fruit"
				disabled
			/>,
		);

		expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveProperty(
			"disabled",
			true,
		);
	});
});
