import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders children and handles clicks", () => {
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Apply filters</Button>);

		fireEvent.click(screen.getByRole("button", { name: "Apply filters" }));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("applies variant class names", () => {
		const { container, rerender } = render(
			<Button variant="primary">Primary</Button>,
		);

		expect(container.querySelector("button")?.className).toMatch(/primary/);

		rerender(<Button variant="secondary">Secondary</Button>);
		expect(container.querySelector("button")?.className).toMatch(/secondary/);

		rerender(<Button variant="tertiary">Tertiary</Button>);
		expect(container.querySelector("button")?.className).toMatch(/tertiary/);
	});

	it("respects disabled state", () => {
		const onClick = vi.fn();

		render(
			<Button disabled onClick={onClick}>
				Disabled
			</Button>,
		);

		const button = screen.getByRole("button", { name: "Disabled" });
		expect(button.hasAttribute("disabled")).toBe(true);

		fireEvent.click(button);

		expect(onClick).not.toHaveBeenCalled();
	});
});
