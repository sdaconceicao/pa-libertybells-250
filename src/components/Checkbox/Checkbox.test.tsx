import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
	afterEach(() => {
		cleanup();
	});

	it("reflects the checked state", () => {
		render(<Checkbox label="Want to go" checked onChange={() => {}} />);

		expect(screen.getByRole("checkbox", { name: "Want to go" })).toHaveProperty(
			"checked",
			true,
		);
	});

	it("calls onChange with the next checked value when toggled", () => {
		const onChange = vi.fn();
		render(<Checkbox label="Been there" checked onChange={onChange} />);

		fireEvent.click(screen.getByRole("checkbox", { name: "Been there" }));

		expect(onChange).toHaveBeenCalledWith(false);
	});

	it("calls onChange with true when an unchecked box is toggled", () => {
		const onChange = vi.fn();
		render(<Checkbox label="Neither" checked={false} onChange={onChange} />);

		fireEvent.click(screen.getByRole("checkbox", { name: "Neither" }));

		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("renders the native disabled state", () => {
		render(
			<Checkbox label="Want to go" checked onChange={() => {}} disabled />,
		);

		expect(screen.getByRole("checkbox", { name: "Want to go" })).toHaveProperty(
			"disabled",
			true,
		);
	});
});
